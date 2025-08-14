import { useEffect, useState } from "react";
import axios from "axios";
import MainPanel, { Stats } from "../templateBack/MainPanel";

const DashboardAdmin = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    axios
      .get("http://localhost:3000/superadmin/stats", { withCredentials: true })
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Failed to load stats", err));
  }, []);

  return (
    <div>
      <MainPanel stats={stats} />
    </div>
  );
};

export default DashboardAdmin;