import React from "react";
import LoginForm from "../../components/auth/LoginForm";

const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="container">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
