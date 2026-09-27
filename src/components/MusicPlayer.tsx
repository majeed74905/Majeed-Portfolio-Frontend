import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { resolved, type MusicTrack } from '@/types/content'

interface Props {
  readonly track: MusicTrack
  readonly className?: string
}

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const rest = Math.floor(seconds % 60)
  return `${minutes}:${rest.toString().padStart(2, '0')}`
}

/**
 * Ambient music player.
 *
 * Honest playback state is the whole design constraint here. The UI is driven
 * entirely by the audio element's own events — `play`, `pause`, `ended`,
 * `timeupdate` — never by optimistic local state. So if the browser refuses to
 * start playback (autoplay policy, decode failure, missing file), the button
 * stays on "play" because the element really is paused. It can never show a
 * pause icon over silence.
 *
 * There is no autoplay at all: sound is started by a click, every time.
 */
export function MusicPlayer({ track, className }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const id = useId()

  const src = resolved(track.src)
  const title = resolved(track.title) ?? 'Untitled'
  const artist = resolved(track.artist)

  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(track.defaultVolume ?? 0.4)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [failed, setFailed] = useState(false)

  // Bind UI state to the element's real state, not to our intentions.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => setPlaying(false)
    const onTime = () => setCurrent(audio.currentTime)
    const onMeta = () => setDuration(audio.duration)
    const onVolume = () => {
      setMuted(audio.muted)
      setVolume(audio.volume)
    }
    const onError = () => {
      setFailed(true)
      setPlaying(false)
    }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('volumechange', onVolume)
    audio.addEventListener('error', onError)

    audio.volume = track.defaultVolume ?? 0.4

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('volumechange', onVolume)
      audio.removeEventListener('error', onError)
      // Stop decoding when this unmounts rather than leaving audio buffered.
      audio.pause()
    }
  }, [track.defaultVolume])

  if (!src) return null

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      // If the browser rejects this, `playing` simply never flips — the button
      // keeps saying "Play", which is the truth.
      audio.play().catch(() => setFailed(true))
    } else {
      audio.pause()
    }
  }

  const seek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(audio.duration)) return
    audio.currentTime = (Number(event.target.value) / 100) * audio.duration
  }

  const changeVolume = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const next = Number(event.target.value) / 100
    audio.volume = next
    if (next > 0 && audio.muted) audio.muted = false
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
  }

  const progress = duration > 0 ? (current / duration) * 100 : 0

  return (
    <section
      aria-labelledby={`${id}-label`}
      // min-w-0: as a grid/flex child this must be allowed to shrink below its
      // intrinsic width, or the range inputs push it past the viewport.
      className={cn('glass-panel min-w-0 p-[var(--space-md)]', className)}
    >
      {/* `loop` is on the element, so the track repeats without JS. */}
      <audio ref={audioRef} src={src} loop preload="none" />

      <div className="flex items-center gap-[var(--space-sm)]">
        <button
          type="button"
          onClick={toggle}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-gold/50 text-gold transition-colors duration-fast ease-standard hover:bg-gold hover:text-bg-deep"
        >
          {/* The accessible name changes with state, so a screen reader hears
              what the button will DO next. */}
          <span className="sr-only">
            {playing ? `Pause ${title}` : `Play ${title}`}
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="currentColor"
          >
            {playing ? (
              <path d="M8 5h3v14H8zM13 5h3v14h-3z" />
            ) : (
              <path d="M8 5l11 7-11 7z" />
            )}
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          <p id={`${id}-label`} className="truncate text-body text-ink">
            {title}
          </p>
          {artist && (
            <p className="truncate text-caption normal-case text-muted">
              {artist}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={toggleMute}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-ink-secondary transition-colors duration-fast ease-standard hover:text-gold"
        >
          <span className="sr-only">{muted ? 'Unmute' : 'Mute'}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="currentColor"
          >
            <path d="M4 9v6h4l5 4V5L8 9H4z" />
            {muted && <path d="M16 8l5 8M21 8l-5 8" stroke="currentColor" strokeWidth="2" />}
          </svg>
        </button>
      </div>

      <div className="mt-[var(--space-sm)] flex min-w-0 items-center gap-[var(--space-sm)]">
        <span className="shrink-0 font-mono text-caption tabular-nums text-muted">
          {formatTime(current)}
        </span>

        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={progress}
          onChange={seek}
          aria-label={`Seek within ${title}`}
          className="h-1 w-full min-w-0 flex-1 cursor-pointer appearance-none rounded-pill bg-border accent-gold"
        />

        <span className="shrink-0 font-mono text-caption tabular-nums text-muted">
          {formatTime(duration)}
        </span>
      </div>

      <div className="mt-[var(--space-sm)] flex min-w-0 items-center gap-[var(--space-sm)]">
        <label
          htmlFor={`${id}-volume`}
          className="shrink-0 font-mono text-caption uppercase text-muted"
        >
          Volume
        </label>
        <input
          id={`${id}-volume`}
          type="range"
          min={0}
          max={100}
          value={Math.round((muted ? 0 : volume) * 100)}
          onChange={changeVolume}
          className="h-1 w-full min-w-0 flex-1 cursor-pointer appearance-none rounded-pill bg-border accent-gold"
        />
      </div>

      {/* Failures and placeholder status are both stated plainly. */}
      <p role="status" aria-live="polite" className="mt-[var(--space-sm)] text-caption normal-case text-muted">
        {failed
          ? 'Audio could not be played in this browser.'
          : track.isPlaceholder
            ? 'Placeholder audio — to be replaced.'
            : ''}
      </p>
    </section>
  )
}
