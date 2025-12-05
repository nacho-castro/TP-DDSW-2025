'use client';
import { Box, Checkbox, Typography } from '@mui/material';
import React from 'react';

export interface Notification {
    _id: string;
    usuarioDestinoId: string;
    mensaje: string;
    leida: boolean;
    fechaCreacion: string;  // ISO date string
    fechaLectura: string | null;
    createdAt: string;
    updatedAt: string;
}

interface NotificationCardProps {
    notification: Notification;
    onReadToggle?: (id: string, read: boolean) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
    notification,
    onReadToggle
}) => {
    const { mensaje, leida } = notification;

    const handleToggle = () => {
        onReadToggle?.(notification._id, !leida);
    };

    return (
        <Box
            onClick={handleToggle}
            sx={{
                backgroundColor: leida ? '#F4F4F4' : '#FFFFFF',
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer',
                boxShadow: leida ? 'none' : '0px 2px 6px rgba(0,0,0,0.08)',
                transition: '0.25s ease',
                '&:hover': {
                    backgroundColor: leida ? '#EDEDED' : '#F9F9F9'
                }
            }}
        >
            {/* Punto indicador de leído/no leído */}
            {!leida && (
                <Box
                    sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: '#fca311',
                        borderRadius: '40%',
                        flexShrink: 0
                    }}
                />
            )}

            {/* Texto */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                    sx={{
                        fontWeight: 600,
                        fontSize: '15px',
                        color: leida ? '#8B8B8B' : '#1E1E1E'
                    }}
                >
                    Nueva notificación
                </Typography>
                <Typography
                    sx={{
                        marginTop: '4px',
                        fontSize: '14px',
                        color: leida ? '#A0A0A0' : '#444444'
                    }}
                >
                    {mensaje}
                </Typography>
            </Box>
        </Box>
    );
};

export default NotificationCard;