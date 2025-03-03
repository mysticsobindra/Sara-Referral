 function calculateReferralEarnings(points_Spent, platform_Percentage, referral_Percentage) {
    const platform_Earnings = (points_Spent * platform_Percentage) / 100;
    return (platform_Earnings * referral_Percentage) / 100;
}

module.exports = { calculateReferralEarnings };