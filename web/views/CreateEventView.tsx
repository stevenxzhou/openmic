import React, {useState} from "react"
import { useEvents } from "@/hooks/useEvents";
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { timeLog } from "console";

const CreateEventView = () => {

  const router = useRouter();
  const { createEvent } = useEvents();

  // Events Form
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [location, setLocation] = useState("")
  
  // Add event handler
  const addEventHandler = () => {
    if (!title || !description || !startTime || !location) {
      alert("Please fill all fields")
      return
    }

    let newEvent = {
      id:0,
      title: title,
      description: description,
      start_date: startTime,
      end_date: endTime,
      location: location
    }

    createEvent(newEvent);

    router.push(`/events/`);
  }

  return (
    <>
    <Header backBtnLink={`/events/`} />
    <div className="p-4">
      <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Event Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
              placeholder="Enter Event Name"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
              placeholder="Enter Event Description"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Start Time</label>
            <input
              type="text"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
            />
          </div>

           <div>
            <label className="block mb-1 font-medium">End Time</label>
            <input
              type="text"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
            />
          </div>
        <div>
        <label className="block mb-1 font-medium">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
            placeholder="Story Coffee"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
      <button
        onClick={addEventHandler}
        className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
      >
        Create Event
      </button>
    </div>
    </div>
    </>
)}

export default CreateEventView