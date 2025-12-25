import React from "react";
import { motion } from "framer-motion";
import { firebaseClient } from "@/api/firebaseClient";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Building2, Calendar, MapPin, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function Experience() {
  const { data: experiences = [] } = useQuery({
    queryKey: ['experiences'],
    queryFn: () => firebaseClient.entities.Experience.list('-order'),
  });

  return (
    <div className="min-h-screen py-12 sm:py-16 md:py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            Work <span className="gradient-text">Experience</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            My professional journey and the amazing teams I've been part of
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 sm:left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500" />

          {/* Experience Items */}
          <div className="space-y-8 sm:space-y-12">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.2 }}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-4 sm:left-6 md:left-1/2 w-3 h-3 sm:w-4 sm:h-4 md:-ml-2 rounded-full bg-blue-500 border-2 sm:border-4 border-white dark:border-slate-900 z-10" />

                {/* Content Card */}
                <div className={`w-full md:w-[calc(50%-2rem)] ml-10 sm:ml-14 md:ml-0 ${
                  index % 2 === 0 ? 'md:mr-8 lg:mr-12' : 'md:ml-8 lg:ml-12'
                }`}>
                  <Card className="p-4 sm:p-6 glass border-0 hover:shadow-xl transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-1">{exp.position}</h3>
                        <div className="flex items-center gap-2 text-blue-500 font-medium mb-1 sm:mb-2">
                          <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-sm sm:text-base">{exp.company}</span>
                        </div>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>
                          {format(new Date(exp.start_date), "MMM yyyy")} - {exp.end_date || "Present"}
                        </span>
                      </div>
                      {exp.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>{exp.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {exp.description && (
                      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-3 sm:mb-4">
                        {exp.description}
                      </p>
                    )}

                    {/* Achievements */}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-xs sm:text-sm">Key Achievements:</h4>
                        <ul className="space-y-1 sm:space-y-2">
                          {exp.achievements.map((achievement, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {experiences.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 sm:py-20"
          >
            <Card className="inline-block p-6 sm:p-8 glass border-0">
              <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">No Experience Yet</h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Experience entries will appear here once added through the Admin Dashboard
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}