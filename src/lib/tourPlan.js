export const getOfferCount = (tour) => Number(tour.offer_count) || tour.offers?.length || 0;
export const hasAcceptedOffer = (tour) => tour.status === "accepted" || tour.offers?.some((offer) => offer.status === "accepted");
