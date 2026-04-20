// Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using RetailAPI.DTOs.AuthDTOs;
using RetailAPI.Services;

namespace RetailAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, errors = ModelState });

            try
            {
                var message = await _authService.RegisterAsync(dto);
                return Ok(new { success = true, message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for {Email}", dto.Email);
                return StatusCode(500, new { success = false, message = "An unexpected error occurred." });
            }
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string email, [FromQuery] string token)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(token))
                return BadRequest(new { success = false, message = "Email and token are required." });

            try
            {
                var message = await _authService.VerifyEmailAsync(email, token);
                return Ok(new { success = true, message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during email verification for {Email}", email);
                return StatusCode(500, new { success = false, message = "An unexpected error occurred." });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, errors = ModelState });

            try
            {
                var message = await _authService.LoginAsync(dto);
                return Ok(new { success = true, message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for {Email}", dto.Email);
                return StatusCode(500, new { success = false, message = "An unexpected error occurred." });
            }
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, errors = ModelState });

            try
            {
                var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
                var ua = Request.Headers["User-Agent"].ToString();

                var tokens = await _authService.VerifyOtpAsync(dto, ip, ua);

                // Get user profile data
                var user = await _authService.GetUserByEmailAsync(dto.Email);
                var defaultAddress = await _authService.GetUserDefaultAddressAsync(user.UserId);

                var userData = new
                {
                    userId = user.UserId,
                    fullName = user.FullName,
                    email = user.Email,
                    phone = user.Phone,
                    role = user.Role?.RoleName ?? "Customer",
                    roleName = user.Role?.RoleName ?? "Customer",
                    isEmailVerified = user.IsEmailVerified,
                    isActive = user.IsActive,
                    createdAt = user.CreatedAt,
                    updatedAt = user.UpdatedAt,
                    addressLine = defaultAddress?.Street,
                    city = defaultAddress?.City,
                    state = defaultAddress?.State,
                    pincode = defaultAddress?.ZipCode
                };

                return Ok(new
                {
                    success = true,
                    message = "Login successful.",
                    accessToken = tokens.AccessToken,
                    refreshToken = tokens.RefreshToken,
                    user = userData
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during OTP verification for {Email}", dto.Email);
                return StatusCode(500, new { success = false, message = "An unexpected error occurred." });
            }
        }
    }
}