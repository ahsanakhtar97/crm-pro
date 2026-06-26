using CRM.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Data;

public class CrmDbContext : DbContext
{
    public CrmDbContext(DbContextOptions<CrmDbContext> options) : base(options) { }

    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Deal> Deals => Set<Deal>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Customer>()
            .HasMany(c => c.Deals)
            .WithOne(d => d.Customer)
            .HasForeignKey(d => d.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Customer>()
            .HasMany(c => c.Tasks)
            .WithOne(t => t.Customer)
            .HasForeignKey(t => t.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Deal>()
            .Property(d => d.Value)
            .HasColumnType("decimal(18,2)");

        // Seed data
        modelBuilder.Entity<Customer>().HasData(
            new Customer { Id = 1, FirstName = "Alice", LastName = "Johnson", Email = "alice@techcorp.com", Phone = "+1-555-0101", Company = "TechCorp", Status = "Active", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Customer { Id = 2, FirstName = "Bob", LastName = "Smith", Email = "bob@acme.com", Phone = "+1-555-0102", Company = "Acme Inc", Status = "Lead", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Customer { Id = 3, FirstName = "Carol", LastName = "White", Email = "carol@globalent.com", Phone = "+1-555-0103", Company = "Global Ent", Status = "Prospect", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );

        modelBuilder.Entity<Deal>().HasData(
            new Deal { Id = 1, Title = "Enterprise License", Value = 50000, Stage = "Proposal", Probability = 60, CustomerId = 1, ExpectedCloseDate = DateTime.UtcNow.AddMonths(1), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Deal { Id = 2, Title = "Starter Package", Value = 5000, Stage = "Qualification", Probability = 40, CustomerId = 2, ExpectedCloseDate = DateTime.UtcNow.AddMonths(2), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Deal { Id = 3, Title = "Premium Support", Value = 12000, Stage = "Negotiation", Probability = 80, CustomerId = 3, ExpectedCloseDate = DateTime.UtcNow.AddDays(15), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );

        modelBuilder.Entity<TaskItem>().HasData(
            new TaskItem { Id = 1, Title = "Follow up on proposal", Priority = "High", Status = "Pending", CustomerId = 1, DueDate = DateTime.UtcNow.AddDays(2), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new TaskItem { Id = 2, Title = "Schedule demo call", Priority = "Medium", Status = "In Progress", CustomerId = 2, DueDate = DateTime.UtcNow.AddDays(5), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );
    }
}
