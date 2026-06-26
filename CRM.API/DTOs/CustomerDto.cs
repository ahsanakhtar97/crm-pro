namespace CRM.API.DTOs;

public record CustomerDto(
    int Id,
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string Company,
    string Status,
    string? Notes,
    DateTime CreatedAt,
    int DealsCount,
    decimal TotalDealValue
);

public record CreateCustomerDto(
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string Company,
    string Status,
    string? Notes
);

public record UpdateCustomerDto(
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string Company,
    string Status,
    string? Notes
);
