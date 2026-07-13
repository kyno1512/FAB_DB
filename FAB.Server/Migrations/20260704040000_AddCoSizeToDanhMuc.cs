using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FAB.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddCoSizeToDanhMuc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CoSize",
                table: "DanhMuc",
                type: "bit",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoSize",
                table: "DanhMuc");
        }
    }
}
