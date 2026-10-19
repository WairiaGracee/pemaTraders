import { MessageCircle } from "lucide-react";
import { SHOP } from "@/lib/config";

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${SHOP.whatsapp}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-green-500 text-white shadow-lg transition hover:scale-105"
    >
      <MessageCircle size={28} />
    </a>
  );
}