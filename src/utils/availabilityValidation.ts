export function availabilityValidation(availability) {
  const errors = [];
  // Check if availability is provided and is a boolean
  if (!Array.isArray(availability)) {
    errors.push('Availability is required and must be an array');
  } else {
    // Validate each availability object in the array
    availability.forEach((schedule, index) => {
      if (
        !schedule ||
        typeof schedule !== 'object' ||
        typeof schedule.dayOfWeek !== 'number' ||
        schedule.dayOfWeek < 0 ||
        schedule.dayOfWeek > 6 ||
        typeof schedule.startTime !== 'string' ||
        typeof schedule.endTime !== 'string'
      ) {
        errors.push(
          `Invalid schedule at index ${index}. Each schedule must have the format: { dayOfWeek: number (0-6), startTime: string (HH:MM AM/PM), endTime: string (HH:MM AM/PM) }`,
        );
      } else {
        // Check if start and end times are valid HH:MM AM/PM format
        const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
        if (
          !timeRegex.test(schedule.startTime) ||
          !timeRegex.test(schedule.endTime)
        ) {
          errors.push(
            `Invalid time format for schedule at index ${index}. Time format should be HH:MM AM/PM`,
          );
        } else {
          //TODO: see
          // Check if start time is before end time
          const startTimeParts = schedule.startTime.split(/[: ]/);
          const endTimeParts = schedule.endTime.split(/[: ]/);
          let startHour = parseInt(startTimeParts[0]);
          let endHour = parseInt(endTimeParts[0]);
          if (startTimeParts[2] === 'PM' && startHour !== 12) startHour += 12;
          if (endTimeParts[2] === 'PM' && endHour !== 12) endHour += 12;
          const timeA = startHour * 60 + parseInt(startTimeParts[1]);
          const timeB = endHour * 60 + parseInt(endTimeParts[1]);
          if (timeA >= timeB) {
            errors.push(
              `Invalid time range for schedule at index ${index}. End time must be after start time`,
            );
          }
        }
      }
    });

    // Check for overlapping schedules
    for (let i = 0; i < availability.length - 1; i++) {
      for (let j = i + 1; j < availability.length; j++) {
        if (availability[i].dayOfWeek === availability[j].dayOfWeek) {
          const startTimeA = parseTime(availability[i].startTime);
          const endTimeA = parseTime(availability[i].endTime);
          const startTimeB = parseTime(availability[j].startTime);
          const endTimeB = parseTime(availability[j].endTime);

          if (startTimeA < endTimeB && startTimeB < endTimeA) {
            errors.push(
              `Schedule at index ${i} overlaps with schedule at index ${j}`,
            );
          }
        }
      }
    }
  }

  return errors.length === 0 ? true : errors;
}

function parseTime(timeString) {
  const [time, period] = timeString.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let hours24 = hours;
  if (period === 'PM' && hours !== 12) {
    hours24 += 12;
  } else if (period === 'AM' && hours === 12) {
    hours24 = 0;
  }
  return hours24 * 60 + minutes;
}
