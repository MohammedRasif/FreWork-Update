export const getAcceptedChatOffer = (offers, chat, userId) => {
  if (chat?.tour_plan_id == null || userId == null) return undefined;
  return (Array.isArray(offers) ? offers : []).find((offer) =>
    offer.status === "accepted" &&
    String(offer.agency?.user) === String(userId) &&
    String(offer.tour_plan?.id) === String(chat?.tour_plan_id),
  );
};

export const getOfferConversationPath = (offer, role) => {
  const base = role === "agency" ? "/agentie/mesaje" : "/cont/mesaje";
  return offer?.room_id != null ? `${base}/${offer.room_id}` : base;
};

export const offerRejectReasons = [
  { labelKey: "reject_reason_price_too_high", value: "Prezzo troppo alto" },
  { labelKey: "reject_reason_offer_unclear", value: "Offerta poco chiara" },
  { labelKey: "reject_reason_destination_unsuitable", value: "Destinazione inadatta" },
  { labelKey: "reject_reason_only_evaluation", value: "Solo valutazione" },
  { labelKey: "reject_reason_chose_another", value: "Ho scelto un'altra proposta" },
];

export const getChatParticipantName = (chat, role, acceptedOffers, userId, t) => {
  if (role !== "agency") return chat?.other_participant_name || t("unknown_user");
  const accepted = getAcceptedChatOffer(acceptedOffers, chat, userId);
  return accepted ? accepted.tour_plan?.name || chat?.other_participant_name || t("unknown_user") : t("chat_private_traveller");
};

export const getOfferNoticeStatus = (messages, ownerId) => {
  if (ownerId == null) return null;
  const prefixes = [
    ["accepted", "Oferta finală a fost acceptată."],
    ["accepted", "Окончательное предложение принято."],
    ["rejected", "Oferta finală a fost refuzată."],
    ["rejected", "Окончательное предложение отклонено."],
  ];
  return [...messages].reverse().reduce((status, message) => {
    if (status || String(message.senderUserId ?? message.sender?.user_id) !== String(ownerId)) return status;
    return prefixes.find(([, prefix]) => message.text?.startsWith(prefix))?.[0] || null;
  }, null);
};
