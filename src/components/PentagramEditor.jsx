import React, { useEffect, useRef, useState } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter } from 'vexflow';
import * as Tone from 'tone';

const PentagramEditor = () => {
  const containerRef = useRef(null);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });

const lcNote1 = new StaveNote({ keys: ['a/4'], duration: 'q' });
const lcNote2 = new StaveNote({ keys: ['a/4'], duration: 'q' });
const lcNote3 = new StaveNote({ keys: ['a/4'], duration: 'q' });
const lcNote4 = new StaveNote({ keys: ['a/4'], duration: 'q' });

// Measure 2:
const lcNote5 = new StaveNote({ keys: ['b/4'], duration: 'q' });
const lcNote6 = new StaveNote({ keys: ['c/5'], duration: 'q' });
const lcNote7 = new StaveNote({ keys: ['b/4'], duration: 'q' });
const lcNote8 = new StaveNote({ keys: ['a/4'], duration: 'q' });

// Measure 3:
const lcNote9 = new StaveNote({ keys: ['a/4'], duration: 'q' });
const lcNote10 = new StaveNote({ keys: ['a/4'], duration: 'q' });
const lcNote11 = new StaveNote({ keys: ['g/4'], duration: 'h' }); // half note

// Combine into a single source array
const notes = [
  lcNote1, lcNote2, lcNote3, lcNote4,
  lcNote5, lcNote6, lcNote7, lcNote8,
  lcNote9, lcNote10, lcNote11
];

  // Group beams if desired, for example beam the eighth notes in each measure.
  // Here, beam notes2 from measure 1 and note5 of measure 2, or adjust per your rhythmic grouping.
  const beams = [];

  // Effect to render the pentagram using VexFlow
  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;
    div.innerHTML = ''; // Clear any previous SVG
    const renderer = new Renderer(div, Renderer.Backends.SVG);
    renderer.resize(800, 200);
    const context = renderer.getContext();

    const stave = new Stave(10, 40, 780);
    stave.addClef('treble').addTimeSignature('4/4'); // adjust as needed
    stave.setContext(context).draw();

    const voice = new Voice({ num_beats: 4, beat_value: 4 });

    voice.setStrict(false); // disable strict timing
    voice.addTickables(notes);

    new Formatter().joinVoices([voice]).format([voice], 700);
    voice.draw(context, stave);
    beams.forEach(beam => {
      beam.setContext(context).draw();
    });

    // Add tooltips on hover for each note element
    const noteElements = div.querySelectorAll('.vf-stavenote');
    noteElements.forEach((noteEl, index) => {
      noteEl.style.cursor = 'pointer';
      noteEl.addEventListener('mouseenter', (e) => {
        const noteName = notes[index].getKeys()[0];
        setTooltip({
          visible: true,
          content: `Note: ${noteName}`,
          x: e.pageX,
          y: e.pageY,
        });
      });
      noteEl.addEventListener('mouseleave', () => {
        setTooltip(prev => ({ ...prev, visible: false }));
      });
    });
  }, []);

  // Function to play the sequence of notes
  const playSequence = async () => {
    if (!isAudioReady) {
      await Tone.start();
      setIsAudioReady(true);
      console.log('AudioContext is ready.');
    }
    const synth = new Tone.PolySynth(Tone.Synth, {
      envelope: {
        attack: 0.01,
        decay: 0.4,
        sustain: 0.1,
        release: 0.8,
      },
    }).toDestination();

    const vexDurationToTone = (duration, dots = 0) => {
      const durationMap = { 'q': '4n', '8': '8n', '16': '16n', 'h': '2n', 'w': '1n' };
      let toneDuration = durationMap[duration] || '4n';
      if (dots > 0) {
        toneDuration += '.'.repeat(dots);
      }
      return toneDuration;
    };

    let currentTime = Tone.Time(0).toSeconds();
    const playbackNotes = notes.map(note => {
      let noteKey = note.getKeys()[0]; // e.g. "d/5"
      noteKey = noteKey.replace('/', '').toUpperCase(); // convert to Tone.js format e.g. "D5"
      const toneDuration = vexDurationToTone(note.duration, note.dots || 0);
      const noteEvent = {
        time: Tone.Time(currentTime).toBarsBeatsSixteenths(),
        note: noteKey,
        duration: toneDuration,
      };
      currentTime += Tone.Time(toneDuration).toSeconds();
      return noteEvent;
    });

    const noteSequence = new Tone.Part((time, value) => {
      synth.triggerAttackRelease(value.note, value.duration, time);
    }, playbackNotes);

    noteSequence.start(0);
    Tone.Transport.start();
  };

  return (
    <div>
      <h3>Interactive Pentagram - Song</h3>
      <p>Hover over a note to see its name. Click the button to play the melody.</p>
      <button onClick={playSequence}>
        {isAudioReady ? 'Play Again' : 'Play Melody'}
      </button>
      <div ref={containerRef} style={{ border: '1px solid #ccc', marginTop: '20px', background: '#f9f9f9' }}></div>
      {tooltip.visible && (
        <div
          style={{
            position: 'absolute',
            top: `${tooltip.y + 15}px`,
            left: `${tooltip.x + 15}px`,
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            pointerEvents: 'none',
            fontSize: '14px',
          }}>
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default PentagramEditor;
