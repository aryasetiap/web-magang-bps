import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

function ProtectedRouteInternAccepted({ children }) {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const [loading, setLoading] = useState(true);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    fetch(`${baseUrl}/internship-applications/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((result) => {
        if (
          result.data &&
          result.data.length > 0 &&
          result.data[0].status === "diterima"
        ) {
          setIsAccepted(true);
        } else {
          setIsAccepted(false);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Memeriksa status magang...</div>;
  if (!isAccepted) return <Navigate to="/dashboard/submissions" replace />;
  return children;
}

export default ProtectedRouteInternAccepted;
