using System.Security.Claims;
using System.Text;
using System.IO;
using FAB.Server.Common;
using FAB.Server.Options;
using FAB.Server.Services.Admin;
using FAB.Server.Services.Chat;
using FAB.Server.Services.Email;
using FAB.Server.Services.Order;
using FAB.Server.Services.Voucher;
using FAB.Server.Services.Payment;
using FAB.Server.Services.Auth;
using FAB.Server.Services.Product;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
        opt.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        opt.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        opt.JsonSerializerOptions.Converters.Add(new FAB.Server.Common.DateOnlyJsonConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddMemoryCache();
builder.Services.AddAutoMapper(typeof(FAB.Server.Models.MappingProfile));
builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection(SmtpOptions.SectionName));
builder.Services.Configure<VnpayOptions>(builder.Configuration.GetSection(VnpayOptions.SectionName));
builder.Services.Configure<GeminiOptions>(builder.Configuration.GetSection(GeminiOptions.SectionName));
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.Configure<GoogleAuthOptions>(builder.Configuration.GetSection(GoogleAuthOptions.SectionName));
builder.Services.AddHttpClient();
builder.Services.AddHttpClient<IGeminiService, GeminiService>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IInvoiceEmailService, InvoiceEmailService>();
builder.Services.AddScoped<IOrderConfirmationEmailService, OrderConfirmationEmailService>();
builder.Services.AddScoped<IVnpayService, VnpayService>();
builder.Services.AddScoped<IVoucherService, VoucherService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IStaffAdminService, StaffAdminService>();
builder.Services.AddScoped<ICustomerAdminService, CustomerAdminService>();
builder.Services.AddScoped<IInventoryAdminService, InventoryAdminService>();
builder.Services.AddScoped<IProductRecipeAdminService, ProductRecipeAdminService>();
builder.Services.AddScoped<IReportsAdminService, ReportsAdminService>();
builder.Services.AddScoped<FAB.Server.Services.Inventory.IOrderInventoryService, FAB.Server.Services.Inventory.OrderInventoryService>();
builder.Services.AddScoped<ISupplierDebtAdminService, SupplierDebtAdminService>();
builder.Services.AddScoped<INewsAdminService, NewsAdminService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = signingKey,
            RoleClaimType = ClaimTypes.Role,
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthConstants.AdminPolicyName, policy =>
        policy.RequireAssertion(context =>
            AuthConstants.AdminStaffRoles.Contains(context.User.FindFirst(ClaimTypes.Role)?.Value ?? "")));
});

// CORS - cho phép frontend dev server
builder.Services.AddCors(options =>
{
            options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5174",
                "http://localhost:5175",
                "http://localhost:5173",
                "http://localhost:5176"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var connectionString = builder.Configuration.GetConnectionString("Connection")
                       ?? builder.Configuration["DB_CONNECTION_STRING"]
                       ?? string.Empty;
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Connection string is not configured. Set ConnectionStrings:Connection or DB_CONNECTION_STRING.");
}

builder.Services.AddDbContext<FAB.Server.Context.FabDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddScoped<FAB.Server.Services.Auth.IAuthService, FAB.Server.Services.Auth.AuthService>();
builder.Services.AddScoped<FAB.Server.Services.Product.IDanhMucService, FAB.Server.Services.Product.DanhMucService>();
builder.Services.AddScoped<FAB.Server.Services.Product.ISanPhamService, FAB.Server.Services.Product.SanPhamService>();
builder.Services.AddScoped<FAB.Server.Services.Product.IProductReviewService, FAB.Server.Services.Product.ProductReviewService>();
builder.Services.AddScoped<FAB.Server.Services.Product.IToppingService, FAB.Server.Services.Product.ToppingService>();
builder.Services.AddScoped<ISizeService, SizeService>();
builder.Services.AddScoped<FAB.Server.Services.Cart.IGioHangService, FAB.Server.Services.Cart.GioHangService>();
builder.Services.AddScoped<FAB.Server.Services.Upload.IFileUploadService, FAB.Server.Services.Upload.FileUploadService>();

var app = builder.Build();

// Auto-launch frontend dev server in a separate terminal when debugging
#if DEBUG
_ = Task.Run(() =>
{
    try
    {
        var frontendDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "fab.client"));
        var psi = new System.Diagnostics.ProcessStartInfo
        {
            FileName = OperatingSystem.IsWindows() ? "cmd.exe" : "bash",
            Arguments = OperatingSystem.IsWindows() ? "/c start \"FAB - Frontend\" cmd /k \"npm run dev\"" : "-c 'npm run dev'",
            WorkingDirectory = frontendDir,
            UseShellExecute = true
        };

        _ = System.Diagnostics.Process.Start(psi);
    }
    catch
    {
        // ignore frontend auto-launch failures
    }
});
#endif

using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("SchemaInit");
    var db = scope.ServiceProvider.GetRequiredService<FAB.Server.Context.FabDbContext>();

    try
    {
        await FAB.Server.Infrastructure.ReviewSchemaInitializer.EnsureAsync(db);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Không thể cập nhật bảng DanhGiaSanPham. Chạy Scripts/alter-product-reviews-guest.sql thủ công.");
    }

    try
    {
        await FAB.Server.Infrastructure.VoucherSchemaInitializer.EnsureAsync(db);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Không thể cập nhật bảng MaGiamGia. Chạy Scripts/add-voucher-email-limit.sql thủ công.");
    }

    try
    {
        await FAB.Server.Infrastructure.NewsSchemaInitializer.EnsureAsync(db);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Không thể tạo bảng TinTuc.");
    }

    try
    {
        await FAB.Server.Infrastructure.OrderSchemaInitializer.EnsureAsync(db);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Không thể cập nhật cột DonHang.TrackingToken. Chạy Scripts/add-tracking-token.sql thủ công.");
    }

    try
    {
        await FAB.Server.Infrastructure.InventorySchemaInitializer.EnsureAsync(db);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Không thể cập nhật cột ChiTietPhieuNhapKho.HanSuDungDen.");
    }

    try
    {
        await FAB.Server.Infrastructure.SizeSchemaInitializer.EnsureAsync(db);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Không thể seed dữ liệu Size.");
    }

    try
    {
        await FAB.Server.Infrastructure.CategorySchemaInitializer.EnsureAsync(db);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Không thể cập nhật CoSize cho danh mục Combo/Bánh.");
    }
}

var smtpOptions = app.Services.GetRequiredService<Microsoft.Extensions.Options.IOptions<SmtpOptions>>().Value;
if (string.IsNullOrWhiteSpace(smtpOptions.User) ||
    string.IsNullOrWhiteSpace(smtpOptions.Pass) ||
    string.IsNullOrWhiteSpace(smtpOptions.FromAddress))
{
    app.Logger.LogWarning(
        "SMTP chưa cấu hình — email xác nhận đơn / hóa đơn sẽ không gửi. Điền Smtp:User, Pass, FromAddress trong User Secrets.");
}

app.UseDeveloperExceptionPage();

app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Tạm thời tắt vì dev chạy HTTP
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");
app.Run();
