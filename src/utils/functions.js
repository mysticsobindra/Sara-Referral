 function calculateReferralEarnings(pointsSpent, platformPercentage, referralPercentage) {
    const platformEarnings = (pointsSpent * platformPercentage) / 100;
    return (platformEarnings * referralPercentage) / 100;
}

module.exports = { calculateReferralEarnings };