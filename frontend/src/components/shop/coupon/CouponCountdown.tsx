"use client";

import { useEffect, useState } from "react";

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

function getCountdown(targetDate: string): CountdownParts {
  const diff = new Date(targetDate).getTime() - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, expired: false };
}

type CouponCountdownProps = {
  endsAt: string;
};

export function CouponCountdown({ endsAt }: CouponCountdownProps) {
  const [parts, setParts] = useState(() => getCountdown(endsAt));

  useEffect(() => {
    setParts(getCountdown(endsAt));
    const timer = window.setInterval(() => {
      setParts(getCountdown(endsAt));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [endsAt]);

  if (parts.expired) {
    return <p className="mb-0 text-danger">หมดอายุแล้ว</p>;
  }

  return (
    <div className="tp-coupon-countdown">
      <div className="tp-coupon-countdown-inner">
        <ul>
          <li>
            <span>{parts.days}</span> วัน
          </li>
          <li>
            <span>{parts.hours}</span> ชม.
          </li>
          <li>
            <span>{parts.minutes}</span> นาที
          </li>
          <li>
            <span>{parts.seconds}</span> วิ.
          </li>
        </ul>
      </div>
    </div>
  );
}
