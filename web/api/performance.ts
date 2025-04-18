// Create a api route to get the performance data from http://127.0.0.1:5000/api/performances
// Data has format:
// [
//     {
//       "event_id": 1,
//       "event_title": "Summer Festival",
//       "performance_id": 1,
//       "songs": 123,
//       "status": "Completed",
//       "user_id": 1,
//       "username": "test_user"
//     },
//     {
//       "event_id": 1,
//       "event_title": "Summer Festival",
//       "performance_id": 2,
//       "songs": 12332,
//       "status": "Completed",
//       "user_id": 1,
//       "username": "test_user"
//     }
//   ]

export const PerformanceStatus = {
    COMPLETED: 'Completed',
    PENDING: 'Pending'
}

export type Performance = {
    event_id: number;
    event_title: string;
    performance_id: number;
    performance_index:number;
    songs: string[];
    status: string;
    user_id: number;
    username: string;
    social_media_alias: string;
}

async function getPerformanceData() {
    const response = await fetch('http://192.168.1.33:5001/api/performances?event_id=2');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
}

// Function to add new performance data
async function addPerformanceData(newPerformance: Performance) {
    const response = await fetch('http://192.168.1.33:5001/api/performances', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPerformance),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
}

// Function to update performance data
async function updatePerformanceData(performance: Performance) {
    const response = await fetch('http://192.168.1.33:5001/api/performances/' + performance.performance_id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(performance),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
}

// Function to update performance data
async function removePerformanceData(performance: Performance) {
    const response = await fetch('http://192.168.1.33:5001/api/performances/' + performance.performance_id, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(performance),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
}

export { getPerformanceData, addPerformanceData, updatePerformanceData, removePerformanceData };