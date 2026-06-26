namespace CRM.API.DTOs;

public record TaskDto(
    int Id,
    string Title,
    string? Description,
    string Priority,
    string Status,
    DateTime? DueDate,
    int? CustomerId,
    string? CustomerName,
    DateTime CreatedAt
);

public record CreateTaskDto(
    string Title,
    string? Description,
    string Priority,
    string Status,
    DateTime? DueDate,
    int? CustomerId
);

public record UpdateTaskDto(
    string Title,
    string? Description,
    string Priority,
    string Status,
    DateTime? DueDate,
    int? CustomerId
);
