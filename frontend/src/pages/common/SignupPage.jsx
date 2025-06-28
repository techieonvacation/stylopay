import React from "react";
import SignupForm from "../../components/auth/SignupForm";

const SignupPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="container">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
