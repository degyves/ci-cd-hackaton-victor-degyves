import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Formatter } from 'vexflow';
import * as Tone from 'tone';

const PentagramEditor = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const VF = { Renderer, Stave, StaveNote, Formatter };
    const div = containerRef.current;
    div.innerHTML = ''; // Clear previous render

    const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    renderer.resize(500, 200);
    const context = renderer.getContext();

    const stave = new VF.Stave(10, 40, 400);
    stave.addClef('treble').setContext(context).draw();

    const notes = [
      new VF.StaveNote({ keys: ['c/4'], duration: 'q' }),
      new VF.StaveNote({ keys: ['d/4'], duration: 'q' }),
      new VF.StaveNote({ keys: ['e/4'], duration: 'q' }),
      new VF.StaveNote({ keys: ['f/4'], duration: 'q' }),
    ];

    new VF.Formatter().joinVoices([new VF.Voice({ num_beats: 4, beat_value: 4 }).addTickables(notes)]).format([new VF.Voice({ num_beats: 4, beat_value: 4 }).addTickables(notes)], 400);
   Each(note => note.setContext(context));
    notes.forEach(note => note.draw());

    // Add hover and click events
    const svgNotes = div.querySelectorAll('g.vf-note');
    svgNotes.forEach((el, i) => {
      el.style.cursor = 'pointer';
      el.addEventListener('mouseenter', () => {
        el.setAttribute('fill', 'blue');
        el.setAttribute('title', notes[i].keys[0]);
      });
      el.addEventListener('mouseleave', () => {
        el.setAttribute('fill', 'black');
     Listener('click', () => {
        playNote(notes[i].keys[0]);
      });
    });
  }, []);

  const playNote = async (note) => {
    await Tone.start();
    const synth = new Tone.Synth().toDestination();
    synth.triggerAttackRelease(note.toUpperCase(), '8n');
  };

  return <div ref={containerRef}></div>;
};

export default PentagramEditor;

