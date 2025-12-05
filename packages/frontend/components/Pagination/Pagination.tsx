'use client';
import React from 'react';
import { Box } from '@mui/material';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <Box
      role="navigation"
      aria-label="Paginación"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
        gap: 2
      }}
    >
      {pageNumbers.map((number) => (
        <Box
          key={number}
          role="button"
          aria-label={`Ir a la página ${number}`}
          aria-current={number === currentPage ? 'page' : undefined}
          onClick={() => onPageChange(number)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            backgroundColor: number === currentPage ? '#333333' : 'transparent',
            color: number === currentPage ? '#ffffff' : '#000000',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: number === currentPage ? 600 : 400,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: number === currentPage ? '#333333' : '#f5f5f5',
              color: number === currentPage ? '#ffffff' : '#000000',
            },
          }}
        >
          {number}
        </Box>
      ))}
    </Box>
  );
};

export default Pagination;