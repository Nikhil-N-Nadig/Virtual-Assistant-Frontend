import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { useFlash } from "../context/FlashContext";

const API_URL = import.meta.env.VITE_BACKEND_URI || "http://127.0.0.1:5000";

const SavedReminders = ({ userId }) => {
  const [reminders, setReminders] = useState([]);
  const { setFlashMessage } = useFlash();

  const loadReminders = async () => {
    try {
      const res = await axios.get(`${API_URL}/reminders/${userId}`);
      setReminders(res.data.reminders || []);
    } catch (err) {
      console.error(err);
      setFlashMessage("Failed to load reminders", "error");
    }
  };

  useEffect(() => {
    if (userId) loadReminders();
  }, [userId]);

  const cancelReminder = async (id) => {
    try {
      await axios.delete(`${API_URL}/reminder/${id}`);
      setReminders(prev => prev.filter(r => r.id !== id));
      setFlashMessage("Reminder canceled", "success");
    } catch (err) {
      console.error(err);
      setFlashMessage("Failed to cancel", "error");
    }
  };

  if (!userId) return <p className="p-4">Please sign in to see reminders.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Saved Reminders</h2>
      {reminders.length === 0 && <p className="text-gray-600">No reminders yet.</p>}
      {reminders.map(rem => (
        <div key={rem.id} className="border rounded-lg p-4 mb-4 bg-white dark:bg-gray-900 shadow">
          <div className="flex justify-between">
            <div>
              <div className="text-sm text-gray-500">Scheduled: {new Date(rem.send_time).toLocaleString()}</div>
              <div className="font-semibold mt-2">Products</div>
              <div className="mt-2">
                {rem.products.map((p,i)=>(
                  <div key={i} className="flex gap-3 items-center mb-2">
                    {p.image ? <img src={p.image} alt={p.title} className="w-14 h-14 object-contain rounded" /> : null}
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-sm text-gray-500">{p.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={()=>cancelReminder(rem.id)} className="text-red-600 hover:text-red-800">
              <Trash2 />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedReminders;
