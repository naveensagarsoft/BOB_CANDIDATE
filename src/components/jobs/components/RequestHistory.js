import React, { useEffect, useState } from "react";
import { Accordion, useAccordionButton } from "react-bootstrap";
import jobsApiService from "../services/jobsApiService";
import { mapRequestHistoryApiToList } from "../mappers/requestHistoryMapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import viewIcon from '../../../assets/view-icon.png';
import { handleEyeClick } from "../../../shared/utils/fileDownload";
const RequestHistory = ({ applicationId, requestTypes = [], refreshKey, onHistoryLoad }) => {
  const [history, setHistory] = useState([]);
  const [activeKey, setActiveKey] = useState(null);

  // 🔑 Create ID → NAME map
  const requestTypeMap = React.useMemo(() => {
    const map = {};
    requestTypes.forEach(rt => {
      map[rt.requestTypeId] = rt.requestName;
    });
    return map;
  }, [requestTypes]);

  useEffect(() => {
    if (!applicationId) return;

    const fetchHistory = async () => {
      try {
        const res = await jobsApiService.getRequestHistory(applicationId);
        const list = mapRequestHistoryApiToList(res?.data);
        setHistory(list);
        onHistoryLoad?.(list);
      } catch (err) {
        console.error("Failed to fetch request history", err);
        setHistory([]);
      }
    };

    fetchHistory();
  }, [applicationId, refreshKey]);
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // convert 0 → 12
    hours = String(hours).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`
  };

  const AccordionRow = ({ eventKey, children }) => {
    const onClick = useAccordionButton(eventKey, () => {
      setActiveKey(prev => (prev === eventKey ? null : eventKey));
    });

    return (
      <tr onClick={onClick} style={{ cursor: "pointer" }}>
        {children}
        <td className="text-end">
          <FontAwesomeIcon
            icon={activeKey === eventKey ? faChevronUp : faChevronDown}
          />
        </td>
      </tr>
    );
  };

  if (!history.length) {
    return <p className="text-muted">No request history available.</p>;
  }

  return (
    <Accordion>
      {/* ✅ TABLE WITH SINGLE HEADER */}
      <table className="table history-table">
        <thead className="table-header">
          <tr>
            <th>Request Type</th>
            <th>Description</th>
            <th>Date & Time</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {history.map((item, index) => (
            <React.Fragment key={item.thread_id}>
              {/* ✅ Accordion Row */}
              <AccordionRow eventKey={String(index)}>
                <td>{requestTypeMap[item.request_type_id] || "—"}</td>
                <td>{item.messages[0]?.message || "-"}</td>
                <td>{formatDateTime(item.created_date) || "-"}</td>
                <td className="status">
                  {item.status}
                </td>
              </AccordionRow>

              {/* ✅ Expandable Content */}
              <tr>
                <td colSpan={4} className="p-0 border-0">
                  <Accordion.Collapse eventKey={String(index)}>
                    <div className="history-thread">
                      {item.messages.map(msg => (
                        <div
                          key={msg.message_id}
                          className={`thread-item ${msg.sender_type}`}
                        >
                          <div className="avatar">
                            {msg.sender_type?.toLowerCase() === "candidate" ? "C" : "R"}
                          </div>
                          <div>
                            <span className="sender-type">
                              {msg.sender_type?.toLowerCase() === "candidate"
                                ? "Request raised by Candidate"
                                : "Response from Recruiter"}
                            </span>
                            <p>
                              <span className="comments-label">Comments: </span>
                              {msg.message}
                              <div className="date-time">{formatDateTime(msg.created_date)}</div>
                            </p>

                            {msg.attachment && (
                              // <a
                              // onClick={() => handleEyeClick(msg.attachment)}
                              //   target="_blank"
                              //   rel="noreferrer"
                              // >
                              //   View Attachment
                              // </a>

                              <div onClick={() => handleEyeClick(msg.attachment)}>
                                <img src={viewIcon} alt="View" style={{ width: "25px", cursor: "pointer" }} />
                              </div>


                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Accordion.Collapse>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </Accordion>
  );

};

export default RequestHistory;
