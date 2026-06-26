namespace CRM.API.DTOs;

public record DealDto(
    int Id,
    string Title,
    decimal Value,
    string Stage,
    int Probability,
    DateTime? ExpectedCloseDate,
    string? Notes,
    int CustomerId,
    string CustomerName,
    DateTime CreatedAt
);

public record CreateDealDto(
    string Title,
    decimal Value,
    string Stage,
    int Probability,
    DateTime? ExpectedCloseDate,
    string? Notes,
    int CustomerId
);

public record UpdateDealDto(
    string Title,
    decimal Value,
    string Stage,
    int Probability,
    DateTime? ExpectedCloseDate,
    string? Notes
);
