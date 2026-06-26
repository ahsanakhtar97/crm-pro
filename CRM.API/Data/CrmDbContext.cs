using CRM.API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Data;

public class CrmDbContext : IdentityDbContext<ApplicationUser>
{
    public CrmDbContext(DbContextOptions<CrmDbContext> options) : base(options) { }

    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Deal> Deals => Set<Deal>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<ActivityNote> Notes => Set<ActivityNote>();
    public DbSet<FileAttachment> Attachments => Set<FileAttachment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); // Critical for Identity

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

        // Add dummy user for seeded data
        var adminId = "b74ddd14-6340-4840-95c2-db12554843e5";
        var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<ApplicationUser>();
        var adminUser = new ApplicationUser 
        { 
            Id = adminId, 
            UserName = "admin@crm.com", 
            NormalizedUserName = "ADMIN@CRM.COM", 
            Email = "admin@crm.com", 
            NormalizedEmail = "ADMIN@CRM.COM", 
            EmailConfirmed = true, 
            FirstName = "Admin", 
            LastName = "User",
            SecurityStamp = Guid.NewGuid().ToString()
        };
        adminUser.PasswordHash = hasher.HashPassword(adminUser, "Admin123!");
        
        modelBuilder.Entity<ApplicationUser>().HasData(adminUser);

        // Seed data
        modelBuilder.Entity<Customer>().HasData(
            new Customer { Id = 1, UserId = adminId, FirstName = "Alice", LastName = "Johnson", Email = "alice@techcorp.com", Phone = "+1-555-0101", Company = "TechCorp", Status = "Active", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Customer { Id = 2, UserId = adminId, FirstName = "Bob", LastName = "Smith", Email = "bob@acme.com", Phone = "+1-555-0102", Company = "Acme Inc", Status = "Lead", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Customer { Id = 3, UserId = adminId, FirstName = "Carol", LastName = "White", Email = "carol@globalent.com", Phone = "+1-555-0103", Company = "Global Ent", Status = "Prospect", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );

        modelBuilder.Entity<Deal>().HasData(
            new Deal { Id = 1, UserId = adminId, Title = "Enterprise License", Value = 50000, Stage = "Proposal", Probability = 60, CustomerId = 1, ExpectedCloseDate = DateTime.UtcNow.AddMonths(1), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Deal { Id = 2, UserId = adminId, Title = "Starter Package", Value = 5000, Stage = "Qualification", Probability = 40, CustomerId = 2, ExpectedCloseDate = DateTime.UtcNow.AddMonths(2), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new Deal { Id = 3, UserId = adminId, Title = "Premium Support", Value = 12000, Stage = "Negotiation", Probability = 80, CustomerId = 3, ExpectedCloseDate = DateTime.UtcNow.AddDays(15), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );

        modelBuilder.Entity<TaskItem>().HasData(
            new TaskItem { Id = 1, UserId = adminId, Title = "Follow up on proposal", Priority = "High", Status = "Pending", CustomerId = 1, DueDate = DateTime.UtcNow.AddDays(2), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new TaskItem { Id = 2, UserId = adminId, Title = "Schedule demo call", Priority = "Medium", Status = "In Progress", CustomerId = 2, DueDate = DateTime.UtcNow.AddDays(5), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );
    }
}
