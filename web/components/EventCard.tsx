import {Event} from "@/api/event"
import { useGlobalContext } from "@/context/useGlobalContext";
import { useNavigate } from "react-router-dom";


export const EventCard = (props: Event) => {
    const { setEventId } = useGlobalContext();
    const navigate = useNavigate();

    const convertDateFormat = (datestr: string): string => {
        // Convert the string into a Date object
        const date = new Date(datestr);

        // Format the date into "Apr 20, 2025"
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    const enterEventViewHandler = (eventId: number) => {
        setEventId(eventId);
        navigate("/status");
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
                <div className="flex-1">
                {/* <!-- Date --> */}
                <p className="text-sm font-medium text-indigo-600">{convertDateFormat(props.start_date)}</p>
                
                {/* <!-- Event Title --> */}
                <h2 className="mt-2 text-xl font-semibold text-gray-900">{props.title}</h2>
                
                {/* <!-- Event Brief --> */}
                <p className="mt-2 text-gray-600">Join us for a day of innovation and networking</p>
                
                {/* <!-- Event Details --> */}
                <div className="mt-4 flex items-center text-sm text-gray-500">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span>Virtual Event</span>
                </div>
                </div>

                {/* <!-- Action Button --> */}
                <div className="flex">
                    <button onClick={() => enterEventViewHandler(props.id)}  
                        className="inline-flex items-center px-4 py-2 border border-transparent 
                                text-sm font-medium rounded-md text-white bg-indigo-600 
                                hover:bg-indigo-700 focus:outline-none focus:ring-2 
                                focus:ring-offset-2 focus:ring-indigo-500 hover:pointer">
                        Enter Event
                    </button>
                </div>
            </div>
        </div>
    )
}