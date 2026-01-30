import * as Speech from "expo-speech";


export function speak(text, lang = "en") {
Speech.speak(text, { language: lang });
}