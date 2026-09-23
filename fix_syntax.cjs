const fs = require("fs");
let code = fs.readFileSync("src/components/AttendanceManager.tsx", "utf8");

code = code.replace(
  `                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}`,
  `                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}`,
);

fs.writeFileSync("src/components/AttendanceManager.tsx", code);
