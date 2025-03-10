"use client";
// Helper to add months to a date
export function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Calculates the approximate number of months between two dates,
 * handling edge cases where dates might be off by a few days
 * @param {Date} startDate - the start date
 * @param {Date} endDate - the end date
 * @returns {number} - the calculated number of months
 */
function calculateMonthsBetween(startDate, endDate) {
  // Get years and months difference
  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();

  // Base calculation
  let months = yearDiff * 12 + monthDiff;

  // Handle the day differences
  const dayDiff = endDate.getDate() - startDate.getDate();

  // If end date's day is earlier than start date's day by more than 7 days,
  // it's not a complete month
  if (dayDiff < -7) {
    months -= 1;
  }
  // If end date's day is later than start date's day by more than 7 days,
  // it's almost a complete extra month
  else if (dayDiff > 7) {
    months += 1;
  }

  // Handle exact 12-month scenarios with slight variations
  if (months === 11 && dayDiff > 20) {
    // Almost 12 months, round up
    months = 12;
  } else if (months === 13 && dayDiff < -20) {
    // Just over 12 months but off by a few days, round down
    months = 12;
  }

  return Math.max(months, 0); // Ensure we never return negative months
}

/**
 * Processes invoice data and returns a structured object
 * @param {Array} invoiceData - the raw invoice data array
 * @param {string} paymentTerm - "monthly" or "quarterly"
 */
export function computePaymentData(invoiceData, paymentTerm) {
  // Separate subscription invoices and one-off fees
  const subscriptionInvoices = invoiceData.filter(
    (inv) => !inv.isSpecialCharge && inv.startDate && inv.endDate
  );
  const oneOffFees = invoiceData.filter((inv) => inv.isSpecialCharge);

  // Process each subscription invoice: compute installment count, amount, schedule
  let subscriptionTotal = 0;
  const subscriptionDetails = subscriptionInvoices.map((invoice) => {
    subscriptionTotal += invoice.serviceAmount;

    const start = new Date(invoice.startDate);
    const end = new Date(invoice.endDate);

    // Improved month difference calculation
    const monthDiff = calculateMonthsBetween(start, end);

    // Number of installments based on payment term
    const installmentCount =
      paymentTerm === "monthly" ? monthDiff : Math.ceil(monthDiff / 3);

    const installmentAmount =
      installmentCount > 0 ? invoice.serviceAmount / installmentCount : 0;

    // Generate a schedule (even if it's zero) so detail view can show it
    const schedule = [];
    let currentDate = new Date(start);

    // Distribute installments evenly throughout the period
    if (installmentCount > 0) {
      const interval = paymentTerm === "monthly" ? 1 : 3;

      for (let i = 0; i < installmentCount; i++) {
        schedule.push({
          date: new Date(currentDate),
          amount: installmentAmount,
        });

        // Add the interval, but ensure we don't go past end date for the last payment
        if (i < installmentCount - 1) {
          currentDate = addMonths(currentDate, interval);
        } else {
          // For the last payment, ensure it's not after the end date
          const lastPaymentDate = addMonths(currentDate, interval);
          if (lastPaymentDate > end) {
            // If adding interval would go past end date, use the end date instead
            currentDate = new Date(end);
          } else {
            currentDate = lastPaymentDate;
          }
        }
      }
    }

    return {
      id: invoice.id,
      serviceTitle: invoice.serviceTitle,
      startDate: start,
      endDate: end,
      totalAmount: invoice.serviceAmount, // in cents
      installmentCount,
      installmentAmount, // in cents
      schedule,
    };
  });

  // Compute overall subscription start and end dates
  let overallStartDate = null;
  let overallEndDate = null;
  if (subscriptionDetails.length > 0) {
    overallStartDate = new Date(
      Math.min(...subscriptionDetails.map((item) => item.startDate))
    );
    overallEndDate = new Date(
      Math.max(...subscriptionDetails.map((item) => item.endDate))
    );
  }

  // Build the aggregator schedule from only those subscription items that have > 0 total
  const aggregatorDetails = subscriptionDetails.filter(
    (detail) => detail.totalAmount > 0
  );

  // Aggregate schedule from these non-zero subscription invoices
  const aggregatedScheduleMap = {};
  aggregatorDetails.forEach((detail) => {
    detail.schedule.forEach((item) => {
      // Use ISO date string as a key to combine same-day installments
      const key = item.date.toISOString().split("T")[0];
      aggregatedScheduleMap[key] =
        (aggregatedScheduleMap[key] || 0) + item.amount;
    });
  });

  // Convert schedule map to a sorted array
  const aggregatedSchedule = Object.entries(aggregatedScheduleMap)
    .map(([dateStr, amount]) => ({
      date: new Date(dateStr),
      amount, // still in cents
    }))
    .sort((a, b) => a.date - b.date);

  // Compute min & max installment amounts across all aggregator schedule entries
  let minInstallmentAmount = 0;
  let maxInstallmentAmount = 0;
  if (aggregatedSchedule.length > 0) {
    const amounts = aggregatedSchedule.map((s) => s.amount);
    minInstallmentAmount = Math.min(...amounts);
    maxInstallmentAmount = Math.max(...amounts);
  }

  // Process one-off fees (for simplicity, assume they're all due on overallStartDate)
  const oneOffDetails = oneOffFees.map((fee) => ({
    id: fee.id,
    serviceTitle: fee.serviceTitle,
    dueDate: overallStartDate,
    amount: fee.serviceAmount, // in cents
  }));

  // Build summary
  const summary = {
    subscription: {
      overallStartDate,
      overallEndDate,
      totalSubscriptionAmount: subscriptionTotal, // sum of all sub invoices in cents
      totalInstallments: aggregatedSchedule.length, // distinct payment dates
      minInstallmentAmount, // in cents
      maxInstallmentAmount, // in cents
      schedule: aggregatedSchedule, // array of {date, amount} in cents
    },
    oneOff: oneOffDetails,
  };

  return {
    summary,
    details: {
      subscriptionDetails, // includes zero-amount items for the detail view
      oneOffDetails,
    },
  };
}
