"use client";
// Helper to add months to a date
export function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
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

    // Compute month difference (inclusive)
    const monthDiff =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth()) +
      1;

    // Number of installments, ignoring invoice.paymentTerms
    // and using the user’s chosen paymentTerm:
    const installmentCount =
      paymentTerm === "monthly" ? monthDiff : Math.ceil(monthDiff / 3);

    const installmentAmount =
      installmentCount > 0 ? invoice.serviceAmount / installmentCount : 0;

    // Generate a schedule (even if it's zero) so detail view can show it
    const schedule = [];
    let currentDate = start;
    for (let i = 0; i < installmentCount; i++) {
      schedule.push({
        date: new Date(currentDate),
        amount: installmentAmount,
      });
      currentDate = addMonths(currentDate, paymentTerm === "monthly" ? 1 : 3);
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
