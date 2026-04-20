// Services/UserService.cs
using RetailAPI.DTOs.UserDTOs;
using RetailAPI.Repositories;

namespace RetailAPI.Services
{
    public interface IUserService
    {
        Task<UserProfileDto?> GetUserProfileAsync(int userId);
    }

    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<UserProfileDto?> GetUserProfileAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return null;
            }

            // Get default address
            var defaultAddress = await _userRepository.GetDefaultAddressAsync(userId);

            return new UserProfileDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role?.RoleName ?? "Customer",
                RoleName = user.Role?.RoleName ?? "Customer",
                IsEmailVerified = user.IsEmailVerified,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                // Address information
                AddressLine = defaultAddress?.Street,
                City = defaultAddress?.City,
                State = defaultAddress?.State,
                Pincode = defaultAddress?.ZipCode
            };
        }
    }
}