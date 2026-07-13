namespace FAB.Server.Common;

public class ServiceResult<T>
{
    public bool Success { get; private init; }
    public T? Data { get; private init; }
    public string? Error { get; private init; }

    public static ServiceResult<T> Ok(T data) => new()
    {
        Success = true,
        Data = data
    };

    public static ServiceResult<T> Fail(string error) => new()
    {
        Success = false,
        Error = error
    };
}

public class ServiceResult
{
    public bool Success { get; private init; }
    public string Message { get; private init; } = string.Empty;
    public string? BottleneckIngredient { get; private init; }
    public int? MaxAvailable { get; private init; }

    public static ServiceResult Ok(string message) => new()
    {
        Success = true,
        Message = message
    };

    public static ServiceResult Fail(string message, string? bottleneckIngredient = null, int? maxAvailable = null) => new()
    {
        Success = false,
        Message = message,
        BottleneckIngredient = bottleneckIngredient,
        MaxAvailable = maxAvailable
    };
}

public class ProductWithoutRecipeException : Exception
{
    public IReadOnlyList<string> ProductNames { get; }

    public ProductWithoutRecipeException(string message) : base(message)
    {
        ProductNames = [];
    }

    public ProductWithoutRecipeException(string message, IReadOnlyList<string> productNames)
        : base(message)
    {
        ProductNames = productNames;
    }
}
