package com.fightwise.app;

import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@CapacitorPlugin(name = "VoiceCoach")
public class VoiceCoachPlugin extends Plugin {
    private TextToSpeech engine;
    private boolean ready;
    private PluginCall pending;
    private String utteranceId;

    @Override
    public void load() {
        getActivity().runOnUiThread(() -> {
            engine = new TextToSpeech(getContext(), status -> {
                ready = status == TextToSpeech.SUCCESS;
                if (!ready) return;
                engine.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String id) {}
                    @Override public void onDone(String id) { complete(id, false); }
                    @Override public void onError(String id) { complete(id, true); }
                });
            });
        });
    }

    private void complete(String id, boolean failed) {
        getActivity().runOnUiThread(() -> {
            if (pending == null || !id.equals(utteranceId)) return;
            PluginCall call = pending;
            pending = null;
            utteranceId = null;
            if (failed) call.reject("Voice playback failed");
            else call.resolve();
        });
    }

    private Voice localVoice(String language) {
        if (!ready || engine == null) return null;
        Set<Voice> voices = engine.getVoices();
        if (voices == null) return null;
        String requested = Locale.forLanguageTag(language).getLanguage();
        Voice best = null;
        for (Voice voice : voices) {
            if (!voice.isNetworkConnectionRequired() && requested.equals(voice.getLocale().getLanguage())) {
                if (best == null || voice.getQuality() > best.getQuality()) best = voice;
            }
        }
        return best;
    }

    @PluginMethod
    public void available(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            JSObject result = new JSObject();
            result.put("available", localVoice(call.getString("language", "en")) != null);
            call.resolve(result);
        });
    }

    @PluginMethod
    public void speak(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            Voice voice = localVoice(call.getString("language", "en"));
            String text = call.getString("text", "");
            if (voice == null || text.isEmpty() || text.length() > 600) {
                call.reject("An installed offline voice is required for this language");
                return;
            }
            stopCurrent();
            if (engine.setVoice(voice) != TextToSpeech.SUCCESS) {
                call.reject("Offline voice could not be selected");
                return;
            }
            engine.setSpeechRate(0.95f);
            pending = call;
            utteranceId = UUID.randomUUID().toString();
            String expectedId = utteranceId;
            getActivity().getWindow().getDecorView().postDelayed(() -> {
                if (pending != null && expectedId.equals(utteranceId)) {
                    PluginCall timedOut = pending;
                    pending = null;
                    utteranceId = null;
                    engine.stop();
                    timedOut.reject("Voice playback timed out");
                }
            }, 20000);
            if (engine.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId) == TextToSpeech.ERROR) {
                pending = null;
                utteranceId = null;
                call.reject("Voice playback failed");
            }
        });
    }

    private void stopCurrent() {
        PluginCall call = pending;
        pending = null;
        utteranceId = null;
        if (engine != null) engine.stop();
        if (call != null) call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            stopCurrent();
            call.resolve();
        });
    }

    @Override
    protected void handleOnPause() {
        getActivity().runOnUiThread(this::stopCurrent);
    }

    @Override
    protected void handleOnDestroy() {
        ready = false;
        stopCurrent();
        if (engine != null) engine.shutdown();
        engine = null;
    }
}
