import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import jobsApiService from "../services/jobsApiService";
import { mapAppliedJobsApiToList } from "../mappers/appliedjobMapper";
import { mapMasterDataApi } from "../mappers/masterDataMapper";
import useDebounce from "./useDebounce";

const useAppliedJobs = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [offerData, setOfferData] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [masterData, setMasterData] = useState({});
  const [isMasterReady, setIsMasterReady] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const userData = useSelector((state) => state.user.user);
  const candidateId = userData?.data?.user?.id;
  

  // ================= MASTER DATA =================
  const fetchMasterData = async () => {
    try {
      const masterResponse = await jobsApiService.getMasterData();
      const mappedMasterData = mapMasterDataApi(masterResponse);
      if (!mappedMasterData || !Object.keys(mappedMasterData).length) {
        return null;
      }
      setMasterData(mappedMasterData);
      setIsMasterReady(true);
      return mappedMasterData;
    } catch (error) {
      return null;
    }
  };

  // ================= FETCH JOBS =================
  const fetchAppliedJobs = async (master) => {
    if (!candidateId || !master) return;

    try {
      setListLoading(true);

      const res = await jobsApiService.getAppliedJobs(
        currentPage,
        pageSize,
        debouncedSearchTerm
      );

      const pageData = res?.data;
      const jobsData = Array.isArray(pageData?.content)
        ? pageData.content
        : [];

      const mappedJobs = mapAppliedJobsApiToList(jobsData, master);

      setAppliedJobs(mappedJobs);
      setTotalPages(pageData?.totalPages ?? 0);
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
      setAppliedJobs([]);
    } finally {
      setListLoading(false);
    }
  };

  // ================= INIT MASTER =================
  useEffect(() => {
    if (!candidateId) return;

    const init = async () => {
      const master = await fetchMasterData();
      if (master) setMasterData(master);
    };

    init();
  }, [candidateId]);
  useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}, [currentPage]);

  // ================= FETCH ON CHANGE =================
  useEffect(() => {
    if (!candidateId || !isMasterReady) return;

    if (!debouncedSearchTerm) {
      fetchAppliedJobs(masterData);
      return;
    }

    if (debouncedSearchTerm.length < 3) return;

    fetchAppliedJobs(masterData);
  }, [candidateId, isMasterReady, currentPage, pageSize, debouncedSearchTerm]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearchTerm, pageSize]);

  // ================= OFFER VIEW =================
  const handleViewOffer = async (job) => {
    try {
      if (!job?.application_id) {
        toast.error("Application ID missing");
        return;
      }

      setListLoading(true);
      const res = await jobsApiService.getOfferLetterByApplicationId(
        job.application_id
      );

      if (!res?.data) {
        toast.error("Offer letter not found");
        return;
      }

      // Handle the response - if res.data is a string URL, wrap it; otherwise use as-is
      const offerDataToSet = typeof res.data === 'string' 
        ? { fileUrl: res.data, applicationId: job.application_id }
        : { ...res.data, applicationId: job.application_id };

      setOfferData(offerDataToSet);
      setShowOfferModal(true);
    } catch (err) {
      toast.error("Unable to load offer letter");
    } finally {
      setListLoading(false);
    }
  };

  // ================= DOWNLOAD =================
  const handleDownloadApplication = async (job) => {
    if (!job?.application_id) return;

    try {
      setDownloadLoading(true);

      const res = await jobsApiService.downloadApplication(
        job.application_id
      );

      const blob = new Blob([res], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Application_Form.pdf";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to download application");
    } finally {
      setDownloadLoading(false);
    }
  };

    const formatStatusLabel = (status) => {
    // if (!status) return "APPLIED";
    return status
      .replace(/_/g, " ")          // Offer_Accepted → Offer Accepted
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase()); // Title Case
  };
const isRequisitionExpired = (endDate) => {
  if (!endDate) return false;
  
  const endDateTime = new Date(endDate);
  const currentDateTime = new Date();
  
  // Set time to end of day (23:59:59) for fair comparison
  endDateTime.setHours(23, 59, 59, 999);
  
  return currentDateTime > endDateTime;
};

const handleRetryPayment = async (job) => {
  try {

    const feeResponse = await jobsApiService.getApplicationFee();
    if (!feeResponse?.success) {
      toast.error("Unable to fetch application fee");
      return;
    }

    const amount = feeResponse.data;

    setSelectedJob({
      ...job,
      application_fee: amount,
      applicationId: job.application_id
    });

    // open payment modal
    setShowPaymentModal(true);

  } catch (err) {
    console.error(err);
    toast.error("Failed to retry payment");
  }
};

const getDaysDifference = (endDate) => {
  if (!endDate) return null;

  const today = new Date();
  const end = new Date(endDate);

  // normalize time (avoid partial day bugs)
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const shouldHideDownload = (endDate) => {
  if (!endDate) return false;

  const today = new Date();
  const end = new Date(endDate);

  // normalize
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  // add 2 days buffer
  const allowedTill = new Date(end);
  allowedTill.setDate(allowedTill.getDate() + 2);

  // 🔥 hide only AFTER buffer
  return today > allowedTill;
};

  return {
    // state
    appliedJobs,
    searchTerm,
    listLoading,
    downloadLoading,
    selectedJob,
    showTrackModal,
    offerData,
    showOfferModal,
    pageSize,
    currentPage,
    totalPages,

    // setters
    setSearchTerm,
    setSelectedJob,
    setShowTrackModal,
    setShowOfferModal,
    setPageSize,
    setCurrentPage,

    // actions
    handleViewOffer,
    shouldHideDownload,
    handleDownloadApplication,
    fetchAppliedJobs,
    masterData,
    formatStatusLabel,
    handleRetryPayment,
    showPaymentModal,
    setShowPaymentModal,
    isRequisitionExpired
  };
};

export default useAppliedJobs;
