const env = {
<<<<<<< HEAD
  // baseURL: "https://fitness-guru.onrender.com/",
  baseURL: "https://smtwnmxmv2.us-east-1.awsapprunner.com",
  EXPO_PUBLIC_RC_IOS: "appl_rjChncDPuinqiACVvFGxGPhweke",
  EXPO_PUBLIC_RC_ANDROID: "goog_TpqQmtpyGcqEEcdleBCcIbetAbO",
=======
  baseURL: "https://fitness-guru.onrender.com/",
  EXPO_PUBLIC_RC_IOS: process.env.EXPO_PUBLIC_RC_IOS || "",
  EXPO_PUBLIC_RC_ANDROID: process.env.EXPO_PUBLIC_RC_ANDROID || "",
>>>>>>> development
};

export default env;
