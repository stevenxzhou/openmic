import {Event} from "@/api/event"
import Link from "next/link";

export const EventCard = (props: Event) => {

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

    const date = new Date(props.end_date);
    const todayDate = new Date();

    const basicEventBtnStyle = "items-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 hover:pointer";
    const activeEventBtnStyle = basicEventBtnStyle + "hover:bg-yellow-700";
    const pastEventBtnStyle = basicEventBtnStyle + "hover:bg-green-700";

    return (
        <div className="bg-white rounded-lg shadow-lg border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow text-sm">
            <div className="flex justify-between items-center">
                <div className="flex-1">
                    {/* <!-- Date --> */}
                    <p className="text-sm font-medium text-yellow-600">{convertDateFormat(props.start_date)}</p>
                    
                    {/* <!-- Event Title --> */}
                    <h2 className="mt-2 text-sm font-semibold text-gray-900">{props.title}</h2>
                    
                    {/* <!-- Event Brief --> */}
                    <p className="mt-2 text-gray-600">{props.description}</p>
                    
                    {/* <!-- Event Details --> */}
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span>{props.location}</span>
                    </div>
                </div>

                {/* <!-- Action Button --> */}
                <div>
                    <Link href={`/events/${props.id}/performances`}
                    className={ date < todayDate ? pastEventBtnStyle : activeEventBtnStyle}>
                    Enter Event
                    </Link>
                </div>
            </div>
        </div>
    )
}