import { useRef, useState } from 'react';
import { allClipUrls } from '../../audio/speech';
import { de } from '../../content/de/strings';
import { MAX_NAME_LENGTH, type Profile } from '../../core/profile/profile';
import type { SaveDoc } from '../../core/save/save';
import { animalIcons } from '../animalIcons';
import { challengeTypes } from '../../modules/challenges';

interface Props {
  doc: SaveDoc;
  onRename: (id: string, name: string) => void;
  onToggleChallenge: (id: string, typeId: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  onSpeech: (on: boolean) => void;
  onSfx: (on: boolean) => void;
  onSessionMinutes: (minutes: number) => void;
  onEndBreak: () => void;
  onImport: (raw: unknown) => void;
  onClose: () => void;
}

function SkillList({ profile }: { profile: Profile }) {
  const entries = Object.entries(profile.skills);
  if (entries.length === 0) return <small className="skill-line">{de.parents.noSkills}</small>;
  return (
    <ul className="skill-list" aria-label={de.parents.skills}>
      {entries.map(([typeId, s]) => {
        const max = challengeTypes.find((t) => t.id === typeId)?.levels ?? s.level;
        return (
          <li key={typeId} className="skill-line">
            {de.parents.skillLine(de.challengeNames[typeId] ?? typeId, s.level, max, s.solved, s.firstTry)}
          </li>
        );
      })}
    </ul>
  );
}

/** Parents area (behind the gate): profiles, settings, backup. Not spoken; adults read it. */
export function ParentsArea({
  doc,
  onRename,
  onToggleChallenge,
  onDelete,
  onSpeech,
  onSfx,
  onSessionMinutes,
  onEndBreak,
  onImport,
  onClose,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState<Profile | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [offline, setOffline] = useState<string | null>(null);

  // Fetching every clip lets the service worker cache them (ADR-0008).
  const downloadVoice = async () => {
    try {
      const urls = await allClipUrls();
      let done = 0;
      const worker = async () => {
        for (let url = urls.pop(); url; url = urls.pop()) {
          await fetch(url);
          setOffline(de.parents.offlineProgress(++done, done + urls.length));
        }
      };
      await Promise.all(Array.from({ length: 6 }, worker));
      setOffline(de.parents.offlineDone);
    } catch {
      setOffline(de.parents.offlineFailed);
    }
  };

  const exportSave = () => {
    const blob = new Blob([JSON.stringify(doc, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `labyrinth-spielstand-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importSave = async (file: File) => {
    try {
      const raw: unknown = JSON.parse(await file.text());
      if (!window.confirm(de.parents.importConfirm)) return;
      onImport(raw);
      setMessage(de.parents.importDone);
    } catch {
      setMessage(de.parents.importFailed);
    }
  };

  return (
    <main className="screen menu-screen parents-screen" data-testid="parents-area">
      <h1 className="title">{de.parents.title}</h1>

      <section className="parents-card">
        <h2>{de.parents.profiles}</h2>
        {doc.profiles.map((p) => (
          <div key={p.id} className="parents-profile" data-testid="parents-profile">
            <span className="profile-icon small" aria-hidden style={{ background: p.avatar.color }}>
              {animalIcons[p.avatar.animal]}
            </span>
            <div className="parents-profile-body">
              <label>
                <span className="sr-only">{de.parents.name}</span>
                <input
                  defaultValue={p.name}
                  maxLength={MAX_NAME_LENGTH}
                  placeholder={de.animals[p.avatar.animal]}
                  aria-label={de.parents.name}
                  onBlur={(e) => onRename(p.id, e.target.value)}
                />
              </label>
              <small>{de.parents.stats(p.stars, p.mazesCompleted, p.rescued.length, p.inventory.length)}</small>
              <SkillList profile={p} />
              <details className="challenge-toggles">
                <summary>{de.parents.challengesTitle}</summary>
                {(['math', 'german'] as const).map((subject) => (
                  <fieldset key={subject}>
                    <legend>{de.parents.subjects[subject]}</legend>
                    {challengeTypes
                      .filter((t) => t.subject === subject)
                      .map((t) => (
                        <label key={t.id} className="toggle small">
                          <input
                            type="checkbox"
                            checked={!p.disabledChallenges.includes(t.id)}
                            onChange={(e) => onToggleChallenge(p.id, t.id, e.target.checked)}
                          />
                          {de.challengeNames[t.id]}
                        </label>
                      ))}
                  </fieldset>
                ))}
                <small>{de.parents.readingNote}</small>
              </details>
            </div>
            <button className="button secondary small" onClick={() => setConfirmDelete(p)}>
              {de.parents.delete}
            </button>
          </div>
        ))}
      </section>

      <section className="parents-card">
        <h2>{de.parents.settings}</h2>
        <label className="toggle">
          <input type="checkbox" checked={doc.settings.speech} onChange={(e) => onSpeech(e.target.checked)} />
          {de.parents.speech}
        </label>
        <label className="toggle">
          <input type="checkbox" checked={doc.settings.sfx} onChange={(e) => onSfx(e.target.checked)} />
          {de.parents.sfx}
        </label>
        <label className="toggle">
          {de.parents.sessionLimit}
          <select
            value={doc.settings.sessionMinutes}
            onChange={(e) => onSessionMinutes(Number(e.target.value))}
            aria-label={de.parents.sessionLimit}
          >
            <option value={0}>{de.parents.sessionOff}</option>
            {[15, 20, 30, 45].map((m) => (
              <option key={m} value={m}>
                {de.parents.sessionMinutes(m)}
              </option>
            ))}
          </select>
        </label>
        {doc.settings.sessionMinutes > 0 && (
          <button className="button secondary small" onClick={onEndBreak}>
            {de.parents.endBreak}
          </button>
        )}
      </section>

      <section className="parents-card">
        <h2>{de.parents.offlineTitle}</h2>
        <p className="hint-text">{de.parents.offlineText}</p>
        <button className="button secondary small" onClick={() => void downloadVoice()}>
          {de.parents.offlineDownload}
        </button>
        {offline && <p aria-live="polite">{offline}</p>}
      </section>

      <section className="parents-card">
        <h2>{de.parents.backup}</h2>
        <div className="button-row">
          <button className="button secondary small" onClick={exportSave}>
            {de.parents.export}
          </button>
          <button className="button secondary small" onClick={() => fileRef.current?.click()}>
            {de.parents.import}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importSave(file);
              e.target.value = '';
            }}
          />
        </div>
        {message && <p>{message}</p>}
        <p className="hint-text">{de.parents.privacy}</p>
      </section>

      <button className="button primary" onClick={onClose}>
        {de.parents.close}
      </button>

      {confirmDelete && (
        <div className="overlay" role="alertdialog" aria-modal>
          <div className="dialog">
            <p className="confirm-question">
              {de.parents.deleteConfirm(confirmDelete.name || de.animals[confirmDelete.avatar.animal])}
            </p>
            <div className="button-row">
              <button className="button secondary" onClick={() => setConfirmDelete(null)}>
                {de.parents.deleteNo}
              </button>
              <button
                className="button primary"
                onClick={() => {
                  onDelete(confirmDelete.id);
                  setConfirmDelete(null);
                }}
              >
                {de.parents.deleteYes}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
