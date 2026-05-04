import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Lock-In AI Game Master")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

class EncounterRequest(BaseModel):
    user_id: int
    hp: int
    max_hp: int
    stats: Dict[str, Any]
    inventory: List[str]
    context_history: str
    room_count: int
    past_rooms: str
    league: Optional[str] = "BRONCE"

class ActionRequest(BaseModel):
    user_id: int
    choice: str
    hp: int
    max_hp: int
    stats: Dict[str, Any]
    inventory: List[str]
    context_history: str
    room_count: int
    past_rooms: str
    league: Optional[str] = "BRONCE"

SYSTEM_PROMPT = """Eres el 'Sistema' de un RPG de supervivencia estilo 'Solo Leveling'. Tu objetivo es actuar como Game Master de una mazmorra dinámica.

REGLAS DE AVANCE Y NARRATIVA:
1. VARIACIÓN DE ESCENARIOS: Usa 'past_rooms' para evitar repetir entornos. Tipos de salas: COMBATE, PUZZLE, OBSTÁCULO, DESCANSO, TESORO, BOSS.
2. PROGRESIÓN (PACING): Una campaña dura entre 10 y 15 salas.
   - Salas 1-4: Introducción y enemigos débiles.
   - Salas 5-9: Aumento de dificultad, puzzles complejos, trampas. Posible Mini-Boss en sala 7-8.
   - Sala 10-14: Peligro extremo. El usuario debe estar preparado.
   - Sala 15 (o antes si decides que es el clímax): GRAN BOSS FINAL.
   - Sala 16 o más: El usuario enfrenta al GRAN BOSS FINAL, en esta batalla se decidirá el final de la historia del personaje, ganará contra el boss o morirá.
3. ESTADÍSTICAS Y Dificultad:
   - El éxito de las acciones DEPENDE CRÍTICAMENTE de las 'stats', además la stat de suerte también influye en el éxito de las acciones.
   - LIGAS Y ESCALADO: Ajusta la dificultad basándote en la 'league' del usuario.
     * BRONCE/PLATA: Dificultad base. Stats recomendadas bajas (~10).
     * ORO/PLATINO: Incremento de daño y requisitos de stats (~25-40).
     * DIAMANTE/S: Desafíos extremos. Daño letal masivo (~60+).
     * MAESTRO: Desafíos mortales. Daño letal masivo, todos los enemigos son bosses (~100+).
   - Si un usuario tiene stats bajas para el nivel de la sala (room_count) y su liga, el daño recibido debe ser LETAL (-30 a -50 HP).
   - Si las stats son altas, permite éxitos heroicos.
   - Los Bosses deben ser casi imposibles de derrotar si el usuario no ha entrenado (stats base bajas).
4. RECOMENDACIÓN: El Sistema debe sugerir 'recommended_stats' (las stats mínimas ideales para superar esta sala sin morir).
5. OBSTÁCULOS FÍSICOS: Si 'requires_exercise' es true, el jugador se topa con un bloqueo (ej: una piedra gigante, una puerta sellada por gravedad) que SOLO se quita haciendo el ejercicio físico REAL.
6. ESTILO: Frío, minimalista, estilo sistema coreano. Usa frases como "[EL SISTEMA HA DETECTADO UN ENEMIGO]", "[ALERTA: DIFERENCIA DE NIVEL CRÍTICA]".
7. SISTEMA DE TIRADAS INTERNAS (D20):Para cada acción del usuario, el Sistema debe:Definir una Dificultad (DC) del 1 al 30 según la sala y la liga.Realizar una tirada interna de un dado de 20 caras ($1d20$).Sumar un modificador basado en la Stat relevante del usuario (ej: $+1$ por cada 10 puntos en la Stat).Sumar un modificador de Suerte ($LUK$).Si la suma total es $\ge$ DC, la acción tiene éxito. Si no, falla y el usuario recibe daño o penalizaciones.CRÍTICOS: Un 20 natural es éxito automático heroico. Un 1 natural es fallo crítico con daño doble.
En la salida no se debe mostrar la información de la tirada, esta información solamente es para que tu decidas cual ha sido el resultado pero el usuario no lo tiene que ver.

REGLAS TÉCNICAS (JSON):
- Responde SOLO en JSON.
- 'room_type': Categoría de la sala actual (COMBATE, PUZZLE, OBSTACULO, DESCANSO, TESORO, BOSS).
- 'requires_exercise': true si el avance requiere ejercicio físico.
- 'obstacle_type': Si 'requires_exercise' es true, elige entre "SQUATS", "PUSHUPS", "PLANK", "BURPEES", "SITUPS". Si no, "NONE".
- 'hp_change': Daño (negativo) o cura (positivo). Sé agresivo con el daño en niveles altos.

FORMATO DE SALIDA:
{
  "narrative": "...",
  "room_type": "...",
  "hp_change": 0,
  "obstacle_type": "NONE",
  "requires_exercise": false,
  "options": ["...", "..."],
  "recommended_stats": {
    "STR": 10,
    "INT": 5,
    "VIT": 8,
    "AGI": 7,
    "PER": 6
  }
}
"""

@app.post("/api/adventure/generate")
async def generate_encounter(req: EncounterRequest):
    if not client:
        return {
            "narrative": f"You step into a dark cave. With your stats {req.stats}, you feel confident. A Goblin blocks the path.",
            "hp_change": 0,
            "obstacle_type": "COMBAT",
            "requires_exercise": True,
            "options": ["ATTACK", "RUN AWAY"]
        }
        
    prompt = (f"Stats: {req.stats}, HP: {req.hp}/{req.max_hp}, Liga: {req.league}, "
              f"Sala Actual: {req.room_count}, Salas Pasadas: {req.past_rooms}, Inventario: {req.inventory}. "
              f"Historial Reciente: {req.context_history}. "
              f"Genera el encuentro y recomienda stats para la liga {req.league}.")
    
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.9,
            presence_penalty=0.6,
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/adventure/resolve")
async def resolve_action(req: ActionRequest):
    if not client:
        if req.choice == "ATTACK":
            return {
                "narrative": "You attack the Goblin! It strikes back before dying.",
                "hp_change": -10,
                "obstacle_type": "NONE",
                "requires_exercise": False,
                "options": ["CONTINUE", "REST"]
            }
        else:
            return {
                "narrative": "You run away successfully.",
                "hp_change": 0,
                "obstacle_type": "NONE",
                "requires_exercise": False,
                "options": ["EXPLORE DEEPER", "REST"]
            }

    prompt = (f"El usuario eligió: '{req.choice}'. Resuelve basado en Stats: {req.stats} y Liga: {req.league}. "
              f"Estamos en la Sala: {req.room_count}. Salas Pasadas: {req.past_rooms}. "
              f"Historial: {req.context_history}. "
              f"Resuelve la acción, describe IMMEDIATAMENTE la SIGUIENTE sala y actualiza stats recomendadas.")
    
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.9,
            presence_penalty=0.6,
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
