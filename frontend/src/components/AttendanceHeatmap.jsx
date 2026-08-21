import React, { useMemo } from 'react';

export default function AttendanceHeatmap({ heatmapData }) {
  // Let's generate a list of the last 120 days
  const gridCells = useMemo(() => {
    const cells = [];
    const today = new Date();
    
    // We want the last 17 weeks (approx 120 days)
    // Find the Sunday of 17 weeks ago
    const startDate = new Date();
    startDate.setDate(today.getDate() - 17 * 7);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek); // Align to Sunday

    // Map heatmapData by date string (YYYY-MM-DD)
    const dataMap = {};
    if (heatmapData && Array.isArray(heatmapData)) {
      heatmapData.forEach(item => {
        dataMap[item.date] = item;
      });
    }

    const currentDate = new Date(startDate);
    const end = new Date(today);
    end.setDate(end.getDate() + (6 - end.getDay())); // Align to Saturday

    while (currentDate <= end) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const record = dataMap[dateStr];
      cells.push({
        date: new Date(currentDate),
        dateStr,
        status: record ? record.status : 'unrecorded',
        present: record ? record.present_count : 0,
        absent: record ? record.absent_count : 0
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return cells;
  }, [heatmapData]);

  // Group cells by week (columns)
  const weeks = useMemo(() => {
    const cols = [];
    for (let i = 0; i < gridCells.length; i += 7) {
      cols.push(gridCells.slice(i, i + 7));
    }
    return cols;
  }, [gridCells]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return '#10B981'; // Emerald Green
      case 'absent':
        return '#EF4444'; // Red/Rose
      case 'partial':
        return '#F59E0B'; // Amber
      default:
        return 'var(--heatmap-unrecorded)'; // Light slate gray
    }
  };

  const getStatusLabel = (cell) => {
    const formattedDate = cell.date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    if (cell.status === 'unrecorded') {
      return `${formattedDate}: No classes recorded`;
    }
    const statusText = cell.status.charAt(0).toUpperCase() + cell.status.slice(1);
    return `${formattedDate}: ${statusText} (${cell.present} present, ${cell.absent} absent)`;
  };

  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIndex) => {
      const firstDayOfMonth = week[0].date;
      const month = firstDayOfMonth.getMonth();
      if (month !== lastMonth) {
        labels.push({
          text: firstDayOfMonth.toLocaleDateString('en-US', { month: 'short' }),
          index: weekIndex
        });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks]);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="attendance-heatmap-container" style={{
      background: 'var(--heatmap-bg)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      border: '1px solid var(--heatmap-border)',
      marginTop: '20px'
    }}>
      <h3 style={{
        margin: '0 0 4px 0',
        fontSize: '18px',
        fontWeight: '700',
        color: 'var(--heatmap-text)',
      }}>Attendance Heatmap</h3>
      <p style={{
        margin: '0 0 20px 0',
        fontSize: '14px',
        color: 'var(--heatmap-text-secondary)'
      }}>Daily attendance summary across all enrolled courses for the last 120 days</p>

      <div style={{ display: 'flex', flexDirection: 'column', overflowX: 'auto', paddingBottom: '10px' }}>
        {/* Month labels header */}
        <div style={{ display: 'flex', marginLeft: '35px', marginBottom: '8px', position: 'relative', height: '20px' }}>
          {monthLabels.map((label, idx) => (
            <div key={idx} style={{
              position: 'absolute',
              left: `${label.index * 16}px`,
              fontSize: '12px',
              fontWeight: '500',
              color: 'var(--heatmap-text-secondary)'
            }}>
              {label.text}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '3px' }}>
          {/* Weekday Labels Column */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginRight: '8px', height: '112px' }}>
            {weekdays.map((day, idx) => (
              <span key={idx} style={{
                fontSize: '10px',
                color: '#94A3B8',
                lineHeight: '13px',
                height: '13px',
                display: 'inline-block'
              }}>
                {idx % 2 === 1 ? day : ''}
              </span>
            ))}
          </div>

          {/* Grid Columns */}
          <div style={{ display: 'flex', gap: '3px' }}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {week.map((cell, cellIndex) => (
                  <div
                    key={cellIndex}
                    title={getStatusLabel(cell)}
                    className="heatmap-cell"
                    style={{
                      width: '13px',
                      height: '13px',
                      borderRadius: '3px',
                      backgroundColor: getStatusColor(cell.status),
                      cursor: 'pointer',
                      transition: 'transform 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginTop: '16px',
        fontSize: '12px',
        color: 'var(--heatmap-text-secondary)',
        borderTop: '1px solid var(--heatmap-legend-border)',
        paddingTop: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--heatmap-unrecorded)' }} />
          <span>No classes</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#10B981' }} />
          <span>Present</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#F59E0B' }} />
          <span>Partial</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#EF4444' }} />
          <span>Absent</span>
        </div>
      </div>
    </div>
  );
}
