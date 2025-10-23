import { GoogleLogin } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import { loginWithGoogle } from "../services/auth";
import { notifyError, notifySuccess } from "../utils/toastConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const LoginGoogleButton = () => {
  const navigate = useNavigate();
  const { updateAuth } = useAuth();

  const googleMutation = useMutation({
    mutationFn: (idToken: string) => loginWithGoogle(idToken),
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem("FLEARN_ACCESS_TOKEN", data.data.accessToken);
        localStorage.setItem("FLEARN_REFRESH_TOKEN", data.data.refreshToken);
        const role = data.data.roles[0];
        localStorage.setItem("FLEARN_USER_ROLE", role);
        updateAuth();
        notifySuccess("Signed in successfully with Google");
        navigate(`/${role.toLowerCase()}`);
      }
    },
    onError: () => notifyError("Google sign-in was cancelled or failed"),
  });

  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        const idToken = credentialResponse?.credential;
        if (!idToken) {
          notifyError(
            "Unable to complete Google sign-in. Please try again later"
          );
          return;
        }
        googleMutation.mutate(idToken);
      }}
      onError={() => notifyError("Google sign-in was cancelled or failed")}
      theme="outline"
      size="large"
      shape="pill"
    />
  );
};

export default LoginGoogleButton;
