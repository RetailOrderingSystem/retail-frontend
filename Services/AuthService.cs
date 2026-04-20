// Services/AuthService.cs
using Microsoft.IdentityModel.Tokens;
using RetailAPI.DTOs.AuthDTOs;
using RetailAPI.Models;
using RetailAPI.Repositories;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Net;

namespace RetailAPI.Services
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(RegisterDto dto);
        Task<string> VerifyEmailAsync(string email, string token);
        Task<string> LoginAsync(LoginDto dto);
        Task<AuthTokenResult> VerifyOtpAsync(VerifyOtpDto dto, string? ipAddress, string? userAgent);
        Task<User> GetUserByEmailAsync(string email);
        Task<Address?> GetUserDefaultAddressAsync(int userId);
    }

    public class AuthTokenResult
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        private const string OtpPurposeLogin = "login";
        private const int OtpExpiryMinutes = 5;
        private const int EmailTokenExpiryHours = 24;
        private const int AccessTokenExpiryMinutes = 60;
        private const int RefreshTokenExpiryDays = 7;
        private const int DefaultUserRoleId = 2; // Assumes: 1=Admin, 2=Customer (seed accordingly)

        public AuthService(
            IUserRepository userRepository,
            IEmailService emailService,
            IConfiguration configuration,
            ILogger<AuthService> logger)
        {
            _userRepository = userRepository;
            _emailService = emailService;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<string> RegisterAsync(RegisterDto dto)
        {
            if (await _userRepository.EmailExistsAsync(dto.Email))
                throw new InvalidOperationException("Email is already registered.");

            var user = new User
            {
                FullName = dto.FullName.Trim(),
                Email = dto.Email.Trim().ToLower(),
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Phone = dto.Phone,
                IsEmailVerified = false,
                IsActive = true,
                RoleId = DefaultUserRoleId,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            var address = new Address
            {
                UserId = user.UserId,
                Street = dto.Street,
                City = dto.City,
                State = dto.State,
                ZipCode = dto.ZipCode,
                Country = dto.Country,
                IsDefault = true,
                CreatedAt = DateTime.UtcNow
            };
            await _userRepository.AddAddressAsync(address);

            var token = GenerateNumericCode(6);
            var verification = new EmailVerification
            {
                UserId = user.UserId,
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddHours(EmailTokenExpiryHours),
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.AddEmailVerificationAsync(verification);
            await _userRepository.SaveChangesAsync();

            await _emailService.SendVerificationEmailAsync(user.Email, token);

            return "Registration successful. Please verify your email.";
        }

        public async Task<string> VerifyEmailAsync(string email, string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                throw new InvalidOperationException("Invalid or already used verification token.");

            var user = await _userRepository.GetByEmailAsync(email)
                ?? throw new InvalidOperationException("Invalid email or token.");

            var decodedToken = WebUtility.UrlDecode(token).Trim();

            _logger.LogInformation("Attempting email verification for {Email} with token: {MaskedToken}",
                email, MaskToken(decodedToken));

            var verification = await _userRepository.GetEmailVerificationAsync(user.UserId, decodedToken)
                ?? throw new InvalidOperationException("Invalid or already used verification token.");

            if (verification.ExpiresAt < DateTime.UtcNow)
                throw new InvalidOperationException("Verification token has expired.");

            verification.IsUsed = true;
            user.IsEmailVerified = true;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.SaveChangesAsync();
            _logger.LogInformation("Email verified for {Email}", email);
            return "Email verified successfully.";
        }

        public async Task<string> LoginAsync(LoginDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email.Trim().ToLower())
                ?? throw new UnauthorizedAccessException("Invalid credentials.");

            if (!user.IsActive)
                throw new UnauthorizedAccessException("Account is inactive. Contact support.");

            if (!user.IsEmailVerified)
                throw new UnauthorizedAccessException("Please verify your email before logging in.");

            await _userRepository.InvalidatePreviousOtpsAsync(user.UserId, OtpPurposeLogin);

            var otpCode = GenerateNumericCode(6);
            var otp = new OtpLog
            {
                UserId = user.UserId,
                OtpCode = otpCode,
                Purpose = OtpPurposeLogin,
                ExpiresAt = DateTime.UtcNow.AddMinutes(OtpExpiryMinutes),
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.AddOtpAsync(otp);
            await _userRepository.SaveChangesAsync();

            _logger.LogInformation("Login OTP generated for {Email}: {MaskedOtp}", user.Email, MaskToken(otpCode));

            await _emailService.SendOtpEmailAsync(user.Email, otpCode);

            return "OTP sent to your registered email.";
        }

        public async Task<AuthTokenResult> VerifyOtpAsync(VerifyOtpDto dto, string? ipAddress, string? userAgent)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email.Trim().ToLower())
                ?? throw new UnauthorizedAccessException("Invalid credentials.");

            var otp = await _userRepository.GetActiveOtpAsync(user.UserId, dto.Otp, OtpPurposeLogin);

            if (otp == null)
            {
                await RecordLoginAttemptAsync(user.UserId, ipAddress, userAgent, false);
                throw new UnauthorizedAccessException("Invalid OTP.");
            }

            if (otp.ExpiresAt < DateTime.UtcNow)
            {
                await RecordLoginAttemptAsync(user.UserId, ipAddress, userAgent, false);
                throw new UnauthorizedAccessException("OTP has expired.");
            }

            otp.IsUsed = true;
            user.UpdatedAt = DateTime.UtcNow;

            var accessToken = GenerateJwtToken(user);
            var refreshTokenValue = GenerateRefreshToken();

            var refreshToken = new RefreshToken
            {
                UserId = user.UserId,
                Token = refreshTokenValue,
                ExpiresAt = DateTime.UtcNow.AddDays(RefreshTokenExpiryDays),
                IsRevoked = false,
                CreatedAt = DateTime.UtcNow
            };
            await _userRepository.AddRefreshTokenAsync(refreshToken);

            await RecordLoginAttemptAsync(user.UserId, ipAddress, userAgent, true);
            await _userRepository.SaveChangesAsync();

            try { await _emailService.SendLoginAlertAsync(user.Email); } catch { /* non-blocking */ }

            return new AuthTokenResult
            {
                AccessToken = accessToken,
                RefreshToken = refreshTokenValue
            };
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
            {
                throw new InvalidOperationException("User not found.");
            }
            return user;
        }

        public async Task<Address?> GetUserDefaultAddressAsync(int userId)
        {
            return await _userRepository.GetDefaultAddressAsync(userId);
        }

        #region Helpers

        private async Task RecordLoginAttemptAsync(int userId, string? ip, string? ua, bool success)
        {
            var history = new LoginHistory
            {
                UserId = userId,
                IpAddress = ip,
                UserAgent = ua,
                IsSuccess = success,
                LoginAt = DateTime.UtcNow
            };
            await _userRepository.AddLoginHistoryAsync(history);
        }

        private string GenerateJwtToken(User user)
        {
            var secretKey = _configuration["JwtSettings:Secret"]
                ?? throw new InvalidOperationException("JWT SecretKey not configured.");
            var issuer = _configuration["JwtSettings:Issuer"] ?? "RetailAPI";
            var audience = _configuration["JwtSettings:Audience"] ?? "RetailAPIUsers";

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("UserId", user.UserId.ToString()),
                new Claim("FullName", user.FullName),
                new Claim(ClaimTypes.Role, user.Role?.RoleName ?? "Customer"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(AccessTokenExpiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateRefreshToken()
        {
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes);
        }

        private static string GenerateNumericCode(int length)
        {
            var bytes = new byte[length];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(bytes);

            var sb = new StringBuilder(length);
            foreach (var b in bytes)
                sb.Append((b % 10).ToString());

            return sb.ToString();
        }

        private static string MaskToken(string token)
        {
            if (string.IsNullOrEmpty(token)) return string.Empty;
            if (token.Length <= 6) return $"***{token[^3..]}";
            return $"{token[..3]}***{token[^3..]}";
        }

        #endregion
    }
}