import { toast } from "react-toastify";
import masterApi from "../../services/master.api";

export const handleEyeClick = async (filePath) => {
  if (!filePath) {
    toast.error("No document available");
    return;
  }

  try {
    const res = await masterApi.getSasUrl(filePath);
    const cleanUrl = res.data ? res?.data?.replace(/\s+/g, "") : res?.replace(/\s+/g, "");

    if (!cleanUrl) {
      toast.error("Invalid document URL");
      return;
    }
    // res.data is already a downloadable URL
    window.open(cleanUrl, "_blank", "noopener,noreferrer");
  } catch (error) {
    toast.error("Unable to open document");
  }
};
