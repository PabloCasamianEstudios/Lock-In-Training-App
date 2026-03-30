package com.lockin.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    private final String jwtSecret = "Esta_Es_Una_Llave_Secreta_Muy_Larga_Para_El_Sistema_De_Leveling_Lock_In_2026_System_Success";
    
    private final int jwtExpirationMs = 86400000; 

    public String generateJwtToken(String email) {
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }
}