const fs = require("fs");
let code = fs.readFileSync("src/components/AttendanceManager.tsx", "utf8");

const targetStr =
  '<button\\s+onClick=\\{\\(\\) =>\\s+updateAttendanceStatus\\(rec\\.id, "excused"\\)\\s+\\}\\s+className=\\{`py-1\\.5 rounded-lg';
const regex = new RegExp(
  '<button\\s+onClick=\\{\\(\\) =>\\s+updateAttendanceStatus\\(rec\\.id, "excused"\\)\\s+\\}\\s+className=\\{`py-1\\.5 rounded-lg[\\s\\S]*',
);

const replacement = `<button
                              onClick={() =>
                                updateAttendanceStatus(rec.id, "excused")
                              }
                              className={\`px-2.5 py-1 rounded-lg text-xs font-bold transition-all \${
                                rec.status === "excused" ? "bg-[var(--warning)] text-white" : "bg-transparent border border-[var(--warning)] text-[var(--warning)] hover:bg-[var(--warning-soft)]"
                              }\`}
                              title="غیبت موجه با هماهنگی (+۱ اعتبار جبرانی به هنرجو اضافه می‌شود)"
                            >
                              موجه (+۱)
                            </button>
                            <button
                              onClick={() =>
                                updateAttendanceStatus(rec.id, "no_show")
                              }
                              className={\`px-2.5 py-1 rounded-lg text-xs font-bold transition-all \${
                                rec.status === "no_show" ? "bg-[var(--danger)] text-white" : "bg-transparent border border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                              }\`}
                            >
                              غیرموجه
                            </button>
                            <button
                              onClick={() =>
                                updateAttendanceStatus(
                                  rec.id,
                                  "teacher_cancelled",
                                )
                              }
                              className={\`px-2.5 py-1 rounded-lg text-xs font-bold transition-all \${
                                rec.status === "teacher_cancelled" ? "bg-[var(--info)] text-white" : "bg-transparent border border-[var(--info)] text-[var(--info)] hover:bg-[var(--info-soft)]"
                              }\`}
                              title="کنسلی استاد (+۱ اعتبار جبرانی به هنرجو اضافه می‌شود)"
                            >
                              کنسلی (+۱)
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: TEACHER-BASED VIEW ================= */}
      {activeAttendanceView === "teacher" && (
        <div className="space-y-4">
          {Array.from(teachersWithRecords).map(([teacherId, teacherRecords]) => {
            const teacher = db.teachers.find((t) => t.id === teacherId);
            
            const tPresent = teacherRecords.filter((r) => r.status === "present").length;
            const tExcused = teacherRecords.filter((r) => r.status === "excused").length;
            const tNoShow = teacherRecords.filter((r) => r.status === "no_show").length;
            const tCancelled = teacherRecords.filter((r) => r.status === "teacher_cancelled").length;

            return (
              <div key={teacherId} className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-xs">
                <div 
                  className="p-4 bg-[var(--bg-tertiary)] flex items-center justify-between cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors"
                  onClick={() => toggleTeacherExpanded(teacherId)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)]">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-[var(--text-primary)]">{teacher?.name || teacherId}</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                        تشکیل شده: {toPersianDigits(tPresent)} | غیبت: {toPersianDigits(tExcused + tNoShow)} | کنسلی: {toPersianDigits(tCancelled)}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={\`w-5 h-5 text-[var(--text-muted)] transition-transform \${expandedTeachers.includes(teacherId) ? "rotate-180" : ""}\`} />
                </div>
                
                {expandedTeachers.includes(teacherId) && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {teacherRecords.map((rec) => {
                      const student = db.students.find((s) => s.id === rec.studentId);
                      return (
                        <div key={rec.id} className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)]">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-bold text-[var(--text-primary)]">{student?.name || rec.studentId}</div>
                              <div className="text-xs text-[var(--text-secondary)] mt-0.5">{rec.time} • {rec.instrument}</div>
                            </div>
                            {(student?.makeupCredits || 0) > 0 && (
                              <span className="px-2 py-0.5 rounded-lg bg-warning-soft text-warning-strong text-[10px] font-bold border border-warning-border">
                                {toPersianDigits(student?.makeupCredits || 0)} جبرانی
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-4 gap-1.5">
                            <button
                              onClick={() =>
                                updateAttendanceStatus(rec.id, "present")
                              }
                              className={\`py-1.5 rounded-lg text-xs font-bold transition-all \${
                                rec.status === "present" ? "bg-[var(--success)] text-white" : "bg-transparent border border-[var(--success)] text-[var(--success)] hover:bg-[var(--success-soft)]"
                              }\`}
                            >
                              حاضر
                            </button>
                            <button
                              onClick={() =>
                                updateAttendanceStatus(rec.id, "excused")
                              }
                              className={\`py-1.5 rounded-lg text-xs font-bold transition-all \${
                                rec.status === "excused" ? "bg-[var(--warning)] text-white" : "bg-transparent border border-[var(--warning)] text-[var(--warning)] hover:bg-[var(--warning-soft)]"
                              }\`}
                              title="غیبت موجه (+۱ جبرانی)"
                            >
                              موجه
                            </button>
                            <button
                              onClick={() =>
                                updateAttendanceStatus(rec.id, "no_show")
                              }
                              className={\`py-1.5 rounded-lg text-xs font-bold transition-all \${
                                rec.status === "no_show" ? "bg-[var(--danger)] text-white" : "bg-transparent border border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                              }\`}
                            >
                              غیرموجه
                            </button>
                            <button
                              onClick={() =>
                                updateAttendanceStatus(
                                  rec.id,
                                  "teacher_cancelled",
                                )
                              }
                              className={\`py-1.5 rounded-lg text-xs font-bold transition-all \${
                                rec.status === "teacher_cancelled" ? "bg-[var(--info)] text-white" : "bg-transparent border border-[var(--info)] text-[var(--info)] hover:bg-[var(--info-soft)]"
                              }\`}
                              title="کنسلی استاد (+۱ جبرانی)"
                            >
                              کنسلی
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
`;

code = code.replace(regex, replacement);
fs.writeFileSync("src/components/AttendanceManager.tsx", code);
