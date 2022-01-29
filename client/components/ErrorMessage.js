const ErrorMessage = ({ errors, field }) => {
  return (
    errors &&
    errors.map(
      (error) =>
        error.field === field && (
          <div key={error.message} className="alert alert-danger">
            <div>{error.message}</div>
          </div>
        )
    )
  );
};

export default ErrorMessage;
