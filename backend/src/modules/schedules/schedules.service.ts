import prisma from '../../prisma';

interface CreateScheduleDTO {
  name: string;
  type?: string;
  lines: {
    dayOfWeek: number;
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
    breakMinutes: number;
  }[];
}

export class SchedulesService {
  
  private calculateWeeklyHours(lines: any[]): number {
    return lines.reduce((total, line) => {
      const start = this.timeToMinutes(line.startTime);
      const end = this.timeToMinutes(line.endTime);
      let worked = (end - start) - line.breakMinutes;
      if (worked < 0) worked = 0;
      return total + (worked / 60);
    }, 0);
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 60) + (minutes || 0);
  }

  async createSchedule(data: CreateScheduleDTO) {
    const schedule = await prisma.workingSchedule.create({
      data: {
        name: data.name,
        type: data.type,
        lines: {
          create: data.lines
        }
      },
      include: { lines: true }
    });
    
    return {
      ...schedule,
      weeklyHours: this.calculateWeeklyHours(schedule.lines)
    };
  }

  async getSchedules() {
    const schedules = await prisma.workingSchedule.findMany({
      include: { lines: true }
    });

    return schedules.map(s => ({
      ...s,
      weeklyHours: this.calculateWeeklyHours(s.lines)
    }));
  }

  async getScheduleById(id: string) {
    const schedule = await prisma.workingSchedule.findUnique({
      where: { id },
      include: { lines: true }
    });

    if (!schedule) throw new Error('Schedule not found');

    return {
      ...schedule,
      weeklyHours: this.calculateWeeklyHours(schedule.lines)
    };
  }

  async deleteSchedule(id: string) {
    return prisma.workingSchedule.delete({ where: { id } });
  }

  async updateSchedule(id: string, data: CreateScheduleDTO) {
    // Delete old lines and create new ones
    await prisma.scheduleLine.deleteMany({ where: { workingScheduleId: id } });
    
    const schedule = await prisma.workingSchedule.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        lines: {
          create: data.lines
        }
      },
      include: { lines: true }
    });

    return {
      ...schedule,
      weeklyHours: this.calculateWeeklyHours(schedule.lines)
    };
  }
}
