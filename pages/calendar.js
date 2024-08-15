import React from 'react';
import Head from 'next/head';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const CalendarPage = () => {
  const handleDateClick = (arg) => {
    // TODO: Implement new meeting creation
    console.log('Date clicked:', arg.date);
  };

  return (
    <>
      <Head>
        <title>Wordy - Calendar</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="calendar-page">
        <h1 className="text-3xl font-bold mb-6">Calendar</h1>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={[]} // TODO: Fetch events from API
          dateClick={handleDateClick}
        />
      </div>
    </>
  );
};

export default CalendarPage;