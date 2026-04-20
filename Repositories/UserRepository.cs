// Repositories/UserRepository.cs
using Microsoft.EntityFrameworkCore;
using RetailAPI.Data;
using RetailAPI.Models;

namespace RetailAPI.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdAsync(int userId);
        Task<bool> EmailExistsAsync(string email);
        Task AddAsync(User user);
        Task AddAddressAsync(Address address);
        Task AddEmailVerificationAsync(EmailVerification verification);
        Task<EmailVerification?> GetEmailVerificationAsync(int userId, string token);
        Task AddOtpAsync(OtpLog otp);
        Task InvalidatePreviousOtpsAsync(int userId, string purpose);
        Task<OtpLog?> GetActiveOtpAsync(int userId, string otpCode, string purpose);
        Task AddRefreshTokenAsync(RefreshToken token);
        Task AddLoginHistoryAsync(LoginHistory history);
        Task<Address?> GetDefaultAddressAsync(int userId);
        Task SaveChangesAsync();
    }

    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByIdAsync(int userId)
        {
            return await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId);
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }

        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
        }

        public async Task AddAddressAsync(Address address)
        {
            await _context.Addresses.AddAsync(address);
        }

        public async Task AddEmailVerificationAsync(EmailVerification verification)
        {
            await _context.EmailVerifications.AddAsync(verification);
        }

        public async Task<EmailVerification?> GetEmailVerificationAsync(int userId, string token)
        {
            return await _context.EmailVerifications
                .FirstOrDefaultAsync(e => e.UserId == userId && e.Token == token && !e.IsUsed);
        }

        public async Task AddOtpAsync(OtpLog otp)
        {
            await _context.OtpLogs.AddAsync(otp);
        }

        public async Task InvalidatePreviousOtpsAsync(int userId, string purpose)
        {
            var previous = await _context.OtpLogs
                .Where(o => o.UserId == userId && o.Purpose == purpose && !o.IsUsed)
                .ToListAsync();

            previous.ForEach(o => o.IsUsed = true);
        }

        public async Task<OtpLog?> GetActiveOtpAsync(int userId, string otpCode, string purpose)
        {
            return await _context.OtpLogs
                .FirstOrDefaultAsync(o =>
                    o.UserId == userId &&
                    o.OtpCode == otpCode &&
                    o.Purpose == purpose &&
                    !o.IsUsed);
        }

        public async Task AddRefreshTokenAsync(RefreshToken token)
        {
            await _context.RefreshTokens.AddAsync(token);
        }

        public async Task AddLoginHistoryAsync(LoginHistory history)
        {
            await _context.LoginHistories.AddAsync(history);
        }

        public async Task<Address?> GetDefaultAddressAsync(int userId)
        {
            return await _context.Addresses
                .FirstOrDefaultAsync(a => a.UserId == userId && a.IsDefault);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}