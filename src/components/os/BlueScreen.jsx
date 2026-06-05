import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useOSStore from '@/store/useOSStore';

/**
 * BlueScreen — Windows BSOD easter egg
 * Triggered when bootState === 'bsod'
 */
export default function BlueScreen() {
  const setBootState = useOSStore((s) => s.setBootState);
  const [dumpProgress, setDumpProgress] = useState(0);
  const [dumpComplete, setDumpComplete] = useState(false);

  useEffect(() => {
    // Animate dump progress
    const interval = setInterval(() => {
      setDumpProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setDumpComplete(true);
          return 100;
        }
        return p + Math.floor(Math.random() * 8) + 2;
      });
    }, 100);

    // Auto-reboot after 5s
    const timeout = setTimeout(() => {
      setBootState('booting');
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [setBootState]);

  return (
    <motion.div
      className="fixed inset-0 z-[99999] select-none cursor-default overflow-hidden"
      style={{
        background: '#0000AA',
        fontFamily: "'Consolas', 'Lucida Console', monospace",
        fontSize: 14,
        color: 'white',
        padding: '5% 8%',
        lineHeight: 1.6,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
    >
      <p className="mb-6">
        A problem has been detected and Windows has been shut down to prevent damage
        to your computer.
      </p>

      <p className="font-bold mb-6 text-lg">
        IRQL_NOT_LESS_OR_EQUAL
      </p>

      <p className="mb-6">
        If this is the first time you've seen this stop error screen,
        restart your computer. If this screen appears again, follow
        these steps:
      </p>

      <p className="mb-2">
        Check to make sure any new hardware or software is properly installed.
        If this is a new installation, ask your hardware or software manufacturer
        for any Windows updates you might need.
      </p>

      <p className="mb-6">
        If problems continue, disable or remove any newly installed hardware
        or software. Disable BIOS memory options such as caching or shadowing.
      </p>

      <p className="mb-2 font-bold">Technical information:</p>
      <p className="mb-6">
        *** STOP: 0x0000000A (0x00000000, 0x00000002, 0x00000000, 0x804FA87B)
      </p>

      <p className="mb-2">
        {dumpComplete
          ? 'Physical memory dump complete.'
          : `Beginning dump of physical memory... ${Math.min(dumpProgress, 100)}%`}
      </p>

      {!dumpComplete && (
        <div className="w-64 h-3 mt-2 mb-4" style={{ background: 'rgba(255,255,255,0.2)' }}>
          <motion.div
            className="h-full"
            style={{ background: 'white', width: `${Math.min(dumpProgress, 100)}%` }}
          />
        </div>
      )}

      {dumpComplete && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-sm"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          Contact your system administrator or technical support group for further assistance.
          <br /><br />
          Rebooting in a moment...
        </motion.p>
      )}
    </motion.div>
  );
}
