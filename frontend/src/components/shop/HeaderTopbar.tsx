"use client";

import { useEffect, useRef, useState } from "react";
import { TopbarSocialIcon } from "@/components/shop/TopbarSocialIcon";
import {
  getVisibleTopbarLanguages,
  getVisibleTopbarSocialLinks,
  type HeaderTopbarConfig,
} from "@/lib/cms/headerCms";

type HeaderTopbarProps = {
  config: HeaderTopbarConfig;
};

export function HeaderTopbar({ config }: HeaderTopbarProps) {
  const languages = getVisibleTopbarLanguages(config);
  const socialLinks = getVisibleTopbarSocialLinks(config);
  const [langOpen, setLangOpen] = useState(false);
  const [languageCode, setLanguageCode] = useState(config.defaultLanguage);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLanguageCode(config.defaultLanguage);
  }, [config.defaultLanguage]);

  useEffect(() => {
    if (!langOpen) return;

    const onClickOutside = (event: MouseEvent) => {
      if (!langRef.current?.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };

    window.addEventListener("click", onClickOutside);
    return () => window.removeEventListener("click", onClickOutside);
  }, [langOpen]);

  if (!config.enabled) return null;

  const phoneHref = config.phone.replace(/[^\d+]/g, "");
  const activeLanguage =
    languages.find((language) => language.code === languageCode) ?? languages[0];

  return (
    <>
      <style>{`
        .tp-header-top-2 .tp-header-info-item:not(:last-child) {
          padding-right: 10px;
          margin-right: 10px;
        }
        .tp-header-top-2 .tp-header-info-item a span {
          color: var(--tp-theme-secondary);
          margin-right: 0;
        }
      `}</style>
      <div className="tp-header-top-2 tp-header-top-border p-relative d-none d-lg-block">
        <div className="container">
          <div className="row align-items-center py-2">
            <div className="col-md-6">
              <div className="tp-header-top-menu d-flex align-items-center justify-content-md-start justify-content-center">
                <div className="tp-header-top-black d-flex align-items-center flex-wrap">
                  {socialLinks.map((link) => (
                    <div key={link.id} className="tp-header-info-item">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.label}
                        title={link.label}
                      >
                        <span>
                          <TopbarSocialIcon link={link} />
                        </span>
                      </a>
                    </div>
                  ))}
                  {config.phone ? (
                    <div className="tp-header-info-item">
                      <a href={`tel:${phoneHref}`}>
                        <span>
                          <i className="fa-light fa-phone" aria-hidden="true" />
                        </span>
                        {config.phone}
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              {languages.length > 0 ? (
                <div className="tp-header-top-menu d-flex align-items-center justify-content-md-end justify-content-center">
                  <div className="tp-header-top-black text-end" ref={langRef}>
                    <div className="tp-header-top-menu-item tp-header-lang">
                      <span
                        id="tp-header-lang-toggle"
                        role="button"
                        tabIndex={0}
                        onClick={() => setLangOpen((open) => !open)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setLangOpen((open) => !open);
                          }
                        }}
                      >
                        {activeLanguage?.label ?? "Language"}
                      </span>
                      <ul className={langOpen ? "tp-lang-list-open" : undefined}>
                        {languages.map((item) => (
                          <li key={item.code}>
                            <button
                              type="button"
                              onClick={() => {
                                setLanguageCode(item.code);
                                setLangOpen(false);
                              }}
                              style={{
                                background: "transparent",
                                border: 0,
                                padding: 0,
                                font: "inherit",
                                color: "inherit",
                                cursor: "pointer",
                              }}
                            >
                              {item.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
