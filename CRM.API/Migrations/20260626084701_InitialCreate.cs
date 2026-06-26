using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CRM.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FirstName = table.Column<string>(type: "TEXT", nullable: false),
                    LastName = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    Phone = table.Column<string>(type: "TEXT", nullable: false),
                    Company = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Deals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    Value = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Stage = table.Column<string>(type: "TEXT", nullable: false),
                    Probability = table.Column<int>(type: "INTEGER", nullable: false),
                    ExpectedCloseDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CustomerId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Deals_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    Priority = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    DueDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CustomerId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tasks_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.InsertData(
                table: "Customers",
                columns: new[] { "Id", "Company", "CreatedAt", "Email", "FirstName", "LastName", "Notes", "Phone", "Status", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "TechCorp", new DateTime(2026, 6, 26, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(5911), "alice@techcorp.com", "Alice", "Johnson", null, "+1-555-0101", "Active", new DateTime(2026, 6, 26, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(5913) },
                    { 2, "Acme Inc", new DateTime(2026, 6, 26, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(5921), "bob@acme.com", "Bob", "Smith", null, "+1-555-0102", "Lead", new DateTime(2026, 6, 26, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(5922) },
                    { 3, "Global Ent", new DateTime(2026, 6, 26, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(5929), "carol@globalent.com", "Carol", "White", null, "+1-555-0103", "Prospect", new DateTime(2026, 6, 26, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(5931) }
                });

            migrationBuilder.InsertData(
                table: "Deals",
                columns: new[] { "Id", "CreatedAt", "CustomerId", "ExpectedCloseDate", "Notes", "Probability", "Stage", "Title", "UpdatedAt", "Value" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 6, 26, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(6381), 1, new DateTime(2026, 7, 26, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(6363), null, 60, "Proposal", "Enterprise License", new DateTime(2026, 6, 26, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(6382), 50000m },
                    { 2, new DateTime(2026, 6, 26, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(6394), 2, new DateTime(2026, 8, 26, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(6391), null, 40, "Qualification", "Starter Package", new DateTime(2026, 6, 26, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(6395), 5000m },
                    { 3, new DateTime(2026, 6, 26, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(6411), 3, new DateTime(2026, 7, 11, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(6402), null, 80, "Negotiation", "Premium Support", new DateTime(2026, 6, 26, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(6413), 12000m }
                });

            migrationBuilder.InsertData(
                table: "Tasks",
                columns: new[] { "Id", "CreatedAt", "CustomerId", "Description", "DueDate", "Priority", "Status", "Title", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 6, 26, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(6532), 1, null, new DateTime(2026, 6, 28, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(6529), "High", "Pending", "Follow up on proposal", new DateTime(2026, 6, 26, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(6534) },
                    { 2, new DateTime(2026, 6, 26, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(6543), 2, null, new DateTime(2026, 7, 1, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(6541), "Medium", "In Progress", "Schedule demo call", new DateTime(2026, 6, 26, 8, 46, 58, 481, DateTimeKind.Utc).AddTicks(6544) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Deals_CustomerId",
                table: "Deals",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_CustomerId",
                table: "Tasks",
                column: "CustomerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Deals");

            migrationBuilder.DropTable(
                name: "Tasks");

            migrationBuilder.DropTable(
                name: "Customers");
        }
    }
}
